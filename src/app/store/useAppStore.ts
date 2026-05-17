import { create } from "zustand";
import { extractDeletedDraftSegment } from "../../features/drafts/draftMonitor";
import { resolvePollutionResult } from "../../features/pollution/pollutionEngine";
import { buildReply } from "../../features/reply/replyEngine";
import { draftCopy, exitCopy, rollbackCopy, storyCopy, uiCopy } from "../../config/hardcodedCopy";
import {
  createSnapshotFromMessage,
  restoreFromMessage
} from "../../features/save-load/saveLoadManager";
import { createIntroMessages } from "../../features/story/stageConfig";
import { resolveEndingType } from "../../features/story/endingResolver";
import { deriveNextStage } from "../../features/story/stateMachine";
import { evaluateTriggers } from "../../features/story/triggerEngine";
import { storageRepository } from "../../services/storage/storageRepository";
import type { LoveTranslationReport } from "../../types/api";
import {
  countNarrativeConversationMessages,
  createChatMessage,
  createEmptySession,
  isLlmContextMessage,
  type PersistedState,
  type SessionState,
  type ShareCardData
} from "../../types/session";
import type { StoryEvent, TaPronoun } from "../../types/story";

let timedPollutionTimer: number | undefined;
const DRAFT_DELETE_SETTLE_MS = 450;
let pendingDeletedDraft = "";
let pendingDeletedDraftTimer: number | undefined;
const DRAFT_PAUSE_HINT_STEPS = [
  { ms: 8000, hint: "你在这里停了很久。" },
  { ms: 16000, hint: "这句话已经被你改得越来越轻了。" },
  { ms: 26000, hint: "有一版更像真话。" }
] as const;
let draftPauseTimers: number[] = [];
let currentDraftEditCount = 0;
let currentDraftPauseLevel = 0;
let currentDraftLastChangedAt: number | undefined;
const monitorImageUrl = new URL("../../../66c8ec9cf7b1f1e882d92c7f0c2e8d73.png", import.meta.url).href;

function resetPendingDeletedDraft() {
  pendingDeletedDraft = "";
  if (typeof window !== "undefined" && pendingDeletedDraftTimer) {
    window.clearTimeout(pendingDeletedDraftTimer);
  }
  pendingDeletedDraftTimer = undefined;
}

function clearDraftPauseTimers() {
  if (typeof window === "undefined") {
    draftPauseTimers = [];
    return;
  }

  draftPauseTimers.forEach((timer) => window.clearTimeout(timer));
  draftPauseTimers = [];
}

function withPersistentFields(session: SessionState, persisted: PersistedState): SessionState {
  return {
    ...session,
    hasFinishedGame: persisted.hasFinishedGame,
    metaMemory: [...persisted.metaMemory],
    shareCardData: persisted.shareCardData
  };
}

function hydrateSessionFromStorage(): SessionState {
  const persisted = storageRepository.read();
  const storedSession = storageRepository.readSession(createEmptySession());
  return withPersistentFields(storedSession, persisted);
}

function persistSession(session: SessionState, overrides: Partial<PersistedState> = {}) {
  const current = storageRepository.read();
  storageRepository.writeSession(session);
  storageRepository.write({
    ...current,
    ...overrides,
    hasFinishedGame: session.hasFinishedGame,
    loadCount: session.loadCount,
    metaMemory: session.metaMemory,
    shareCardData: session.shareCardData,
    version: current.version
  });
}

function createExitLabel(exitClickCount: number): string {
  if (exitClickCount >= 2) {
    return uiCopy.exitLabels.locked;
  }

  if (exitClickCount >= 1) {
    return uiCopy.exitLabels.warned;
  }

  return uiCopy.exitLabels.default;
}

function createSpaceLabel(spaceVisitCount: number): string {
  if (spaceVisitCount >= 2) {
    return uiCopy.spaceLabels.late;
  }

  return uiCopy.spaceLabels.default;
}

interface AppStore {
  hydrated: boolean;
  isReplying: boolean;
  isTaTyping: boolean;
  draftWhisper: string;
  draftEditCount: number;
  draftPauseLevel: number;
  pendingUserMessages: SessionState["chatHistory"];
  session: SessionState;
  hydrate: () => void;
  selectSetup: (taPronoun: TaPronoun) => Promise<void>;
  updateDraft: (
    previousValue: string,
    nextValue: string,
    options?: {
      isDeleting?: boolean;
      isComposing?: boolean;
      deletionType?: "deleteContentBackward" | "deleteContentForward" | "";
      timestamp?: number;
    }
  ) => void;
  sendMessage: (input: string, pendingMessageId?: string) => Promise<void>;
  rollbackToMessage: (messageId: string) => void;
  completeLocationReveal: () => void;
  sendLocationTurnBack: () => void;
  revealLocationLie: () => void;
  revealLocationOmnipresence: () => void;
  visitSpace: () => void;
  exitAttempt: () => Promise<void>;
  enterTruthReveal: () => void;
  completeTruth: () => void;
  finishWakeUp: () => void;
  resetForReplay: () => void;
  patchSession: (patch: Partial<SessionState>) => void;
  saveTranslatorReport: (report: LoveTranslationReport) => void;
  saveShareCardData: (data: ShareCardData) => void;
  getExitLabel: () => string;
  getSpaceLabel: () => string;
}

function getRandomTaLineDelayMs() {
  return 1000 + Math.floor(Math.random() * 1001);
}

async function waitForTaLineDelay() {
  if (typeof window === "undefined") {
    return;
  }

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, getRandomTaLineDelayMs());
  });
}

function createIntroSpaceNotice(pronoun: TaPronoun | null) {
  return createChatMessage("system", storyCopy.introSpaceNotice(pronoun), {
    kind: "space_notice"
  });
}

function createLocationNotice() {
  return createChatMessage("system", storyCopy.locationNotice, {
    kind: "location_notice"
  });
}

function createMonitorImageMessage() {
  return createChatMessage("ta", storyCopy.monitorImageAlt, {
    kind: "monitor_image",
    mediaUrl: monitorImageUrl
  });
}

function createPendingUserMessage(displayedText: string) {
  return createChatMessage("user", displayedText, {
    kind: "pending"
  });
}

export const useAppStore = create<AppStore>((set, get) => {
  let isFlushingPendingQueue = false;

  const resetDraftPauseState = () => {
    clearDraftPauseTimers();
    currentDraftEditCount = 0;
    currentDraftPauseLevel = 0;
    currentDraftLastChangedAt = undefined;
    set({
      draftWhisper: "",
      draftEditCount: 0,
      draftPauseLevel: 0
    });
  };

  const scheduleDraftPauseHints = () => {
    clearDraftPauseTimers();

    if (typeof window === "undefined") {
      return;
    }

    draftPauseTimers = DRAFT_PAUSE_HINT_STEPS.map((step, index) =>
      window.setTimeout(() => {
        currentDraftPauseLevel = index + 1;
        set({
          draftWhisper: step.hint,
          draftPauseLevel: currentDraftPauseLevel
        });
      }, step.ms)
    );
  };

  const flushPendingQueue = () => {
    if (isFlushingPendingQueue) {
      return;
    }

    const state = get();
    const nextPendingMessage = state.pendingUserMessages[0];

    if (!nextPendingMessage || state.isReplying) {
      return;
    }

    isFlushingPendingQueue = true;

    void get()
      .sendMessage(nextPendingMessage.displayedText, nextPendingMessage.id)
      .finally(() => {
        isFlushingPendingQueue = false;

        if (!get().isReplying) {
          flushPendingQueue();
        }
      });
  };

  const appendTaReplyLine = (line: string, kind: "normal" | "glitch" | "warning") => {
    const streamedSession = {
      ...get().session,
      chatHistory: [...get().session.chatHistory, createChatMessage("ta", line, { kind })]
    };

    set({ session: streamedSession });
    persistSession(streamedSession);
  };

  const finishTaTyping = () => {
    set({ session: get().session, isReplying: false, isTaTyping: false });
    flushPendingQueue();
  };

  const streamTaReplyLines = async (
    replyLines: readonly string[],
    kind: "normal" | "glitch" | "warning",
    options: {
      waitBeforeFirstLine?: boolean;
    } = {}
  ) => {
    if (replyLines.length === 0) {
      finishTaTyping();
      return;
    }

    if (options.waitBeforeFirstLine) {
      await waitForTaLineDelay();
    }

    for (let index = 0; index < replyLines.length; index += 1) {
      appendTaReplyLine(replyLines[index], kind);

      if (index === 0) {
        set({
          session: get().session,
          isReplying: false,
          isTaTyping: replyLines.length > 1
        });
        flushPendingQueue();
      }

      if (index < replyLines.length - 1) {
        await waitForTaLineDelay();
      }
    }

    finishTaTyping();
  };

  return {
  hydrated: false,
  isReplying: false,
  isTaTyping: false,
  draftWhisper: "",
  draftEditCount: 0,
  draftPauseLevel: 0,
  pendingUserMessages: [],
  session: createEmptySession(),

  // no-op placeholder to satisfy method ordering in returned object

  hydrate: () => {
    set({
      hydrated: true,
      session: hydrateSessionFromStorage(),
      isReplying: false,
      isTaTyping: false,
      draftWhisper: "",
      draftEditCount: 0,
      draftPauseLevel: 0,
      pendingUserMessages: []
    });
  },

  selectSetup: async (taPronoun) => {
    resetPendingDeletedDraft();
    resetDraftPauseState();
    const persisted = storageRepository.read();
    const nextSession = withPersistentFields(createEmptySession(), persisted);
    nextSession.taPronoun = taPronoun;
    nextSession.stage = "intro";
    nextSession.chatHistory = [];
    const finalSession = {
      ...nextSession,
      chatHistory: [...createIntroMessages(taPronoun), createIntroSpaceNotice(taPronoun)]
    };

    set({
      session: finalSession,
      isReplying: false,
      isTaTyping: false,
      pendingUserMessages: []
    });
    persistSession(finalSession);
  },

  updateDraft: (previousValue, nextValue, options = {}) => {
    if (options.isComposing) {
      return;
    }

    const timestamp = options.timestamp ?? Date.now();
    const previousTrimmed = previousValue.trim();
    const nextTrimmed = nextValue.trim();

    if (!nextTrimmed && !options.isDeleting) {
      resetPendingDeletedDraft();
      resetDraftPauseState();
      return;
    }

    if (previousValue !== nextValue) {
      if (!previousTrimmed) {
        currentDraftEditCount = 0;
      }
      currentDraftPauseLevel = 0;
      currentDraftLastChangedAt = timestamp;
      set({
        draftWhisper: "",
        draftEditCount: currentDraftEditCount,
        draftPauseLevel: 0
      });
      if (nextTrimmed) {
        scheduleDraftPauseHints();
      } else {
        clearDraftPauseTimers();
      }
    }

    if (!options.isDeleting) {
      resetPendingDeletedDraft();
      return;
    }

    const deletedSegment = extractDeletedDraftSegment(previousValue, nextValue);

    if (!deletedSegment) {
      return;
    }

    currentDraftEditCount += 1;
    set({
      draftWhisper: get().draftWhisper,
      draftEditCount: currentDraftEditCount,
      draftPauseLevel: get().draftPauseLevel
    });

    pendingDeletedDraft =
      options.deletionType === "deleteContentForward"
        ? `${pendingDeletedDraft}${deletedSegment}`
        : `${deletedSegment}${pendingDeletedDraft}`;

    if (typeof window !== "undefined" && pendingDeletedDraftTimer) {
      window.clearTimeout(pendingDeletedDraftTimer);
    }

    if (typeof window === "undefined") {
      return;
    }

    pendingDeletedDraftTimer = window.setTimeout(() => {
      const deletedDraft = pendingDeletedDraft.trim();
      resetPendingDeletedDraft();

      if (deletedDraft.length < 3) {
        return;
      }

      void (async () => {
        await waitForTaLineDelay();

        set((state) => {
          if (state.session.deletedDrafts.includes(deletedDraft)) {
            return state;
          }

          const nextSession = {
            ...state.session,
            stage: "draft_exposed" as const,
            chatHistory: [
              ...state.session.chatHistory,
              createChatMessage(
                "ta",
                draftCopy.buildImmediateReply(deletedDraft),
                { kind: "glitch" }
              )
            ],
            deletedDrafts: [...state.session.deletedDrafts, deletedDraft],
            deletedDraftCount: state.session.deletedDraftCount + 1,
            metaMemory: [...state.session.metaMemory, draftCopy.buildMetaMemory(deletedDraft)]
          };

          persistSession(nextSession);
          return { session: nextSession };
        });
      })();
    }, DRAFT_DELETE_SETTLE_MS);
  },

  sendMessage: async (input, pendingMessageId) => {
    const userInput = input.trim();

    if (!userInput) {
      return;
    }

    if (get().isReplying && !pendingMessageId) {
      set((state) => ({
        pendingUserMessages: [...state.pendingUserMessages, createPendingUserMessage(userInput)]
      }));
      return;
    }

    const session = get().session;
    const nextSendCount = session.sendCount + 1;
    const nextTotalConversationCount = countNarrativeConversationMessages(session.chatHistory) + 1;
    const now = Date.now();
    const hesitationSeconds =
      currentDraftLastChangedAt && currentDraftPauseLevel > 0
        ? Math.max(1, Math.round((now - currentDraftLastChangedAt) / 1000))
        : 0;
    const shouldRecordHesitation = currentDraftPauseLevel > 0 && hesitationSeconds > 0;
    const shouldRecordHeavyEditing = currentDraftEditCount >= 2;

    const triggerEvaluation = evaluateTriggers(session, userInput, nextSendCount);
    const hasShownMonitorImage = session.chatHistory.some((message) => message.kind === "monitor_image");
    const shouldSendMonitorImage = nextTotalConversationCount >= 15 && !hasShownMonitorImage;
    const pollution = await resolvePollutionResult({
      userInput,
      stage: session.stage,
      pollutionCount: session.pollutionCount,
      sendCount: nextSendCount,
      triggerReason: triggerEvaluation.triggerReason,
      keyword: triggerEvaluation.keyword,
      events: triggerEvaluation.events,
      taPronoun: session.taPronoun,
      recentMessages: session.chatHistory.filter(isLlmContextMessage).slice(-4).map((message) => ({
        role: message.role,
        text: message.role === "user" ? message.originalText?.trim() || message.displayedText : message.displayedText
      }))
    });
    const events = [...triggerEvaluation.events];
    if (shouldRecordHesitation) {
      events.push("hesitation_noticed");
    }
    const userMessage = {
      id: pendingMessageId ?? createChatMessage("user", "").id,
      role: "user" as const,
      displayedText: pollution?.pollutedText ?? userInput,
      originalText: pollution ? userInput : undefined,
      kind: pollution ? ("polluted" as const) : ("normal" as const),
      timestamp:
        get().pendingUserMessages.find((message) => message.id === pendingMessageId)?.timestamp ?? Date.now()
    };
    const nextStage = deriveNextStage({
      session,
      nextSendCount,
      triggerReason: triggerEvaluation.triggerReason,
      events,
      enterMetaBreak: triggerEvaluation.enterMetaBreak
    });

    const nextSession: SessionState = {
      ...session,
      stage: nextStage,
      chatHistory: [...session.chatHistory, userMessage],
      originalInputs: [...session.originalInputs, userInput],
      pollutedInputs: pollution ? [...session.pollutedInputs, pollution.pollutedText] : session.pollutedInputs,
      triggeredKeywords:
        pollution?.keyword && !session.triggeredKeywords.includes(pollution.keyword)
          ? [...session.triggeredKeywords, pollution.keyword]
          : session.triggeredKeywords,
      pollutionCount: pollution ? session.pollutionCount + 1 : session.pollutionCount,
      sendCount: nextSendCount,
      forcedPollutionRemaining:
        nextSendCount === 3
          ? 4
          : pollution && session.forcedPollutionRemaining > 0
            ? Math.max(0, session.forcedPollutionRemaining - 1)
            : session.forcedPollutionRemaining,
      activeTimedPollution: triggerEvaluation.startTimedWindow || session.activeTimedPollution,
      metaMemory:
        pollution && pollution.triggerReason === "count"
          ? [...session.metaMemory, "第三次发送时，话语第一次被改写。"]
          : session.metaMemory,
      endingType: resolveEndingType({
        ...session,
        pollutionCount: pollution ? session.pollutionCount + 1 : session.pollutionCount,
        deletedDraftCount: session.deletedDraftCount,
        loadCount: session.loadCount
      })
    };
    let deferredSystemNotice: ReturnType<typeof createChatMessage> | null = null;

    if (shouldRecordHesitation || shouldRecordHeavyEditing) {
      const draftMetaLines = [];
      if (shouldRecordHesitation) {
        draftMetaLines.push(`这句话在发出前停了${hesitationSeconds}秒。`);
      }
      if (shouldRecordHeavyEditing) {
        draftMetaLines.push(`这句话在输入框里被改了${currentDraftEditCount}次。`);
      }
      nextSession.metaMemory = [...nextSession.metaMemory, draftMetaLines.join("")];
    }

    resetDraftPauseState();

    if (triggerEvaluation.events.includes("draft_exposed")) {
      deferredSystemNotice = createChatMessage(
        "system",
        `输入框刚刚替你记住了：${
          session.deletedDrafts[session.deletedDrafts.length - 1] ?? "你刚刚那句没发出来的话。"
        }`,
        { kind: "warning" }
      );
      nextSession.metaMemory = [...nextSession.metaMemory, "被删掉的草稿开始反咬回来。"];
    }

    if (typeof window !== "undefined" && timedPollutionTimer) {
      window.clearTimeout(timedPollutionTimer);
    }

    if (triggerEvaluation.startTimedWindow && typeof window !== "undefined") {
      timedPollutionTimer = window.setTimeout(() => {
        set((current) => {
          const timedSession = {
            ...current.session,
            activeTimedPollution: false,
            stage: current.session.stage === "time_pollution" ? "normal_chat" : current.session.stage
          };
          persistSession(timedSession);
          return {
            session: timedSession
          };
        });
      }, 30000);
    }

    set((state) => ({
      session: nextSession,
      isReplying: true,
      isTaTyping: true,
      pendingUserMessages: pendingMessageId
        ? state.pendingUserMessages.filter((message) => message.id !== pendingMessageId)
        : state.pendingUserMessages
    }));
    persistSession(nextSession);

    if (shouldSendMonitorImage) {
      void (async () => {
        await waitForTaLineDelay();

        const imageSession = {
          ...get().session,
          chatHistory: [...get().session.chatHistory, createMonitorImageMessage()],
          metaMemory: [...get().session.metaMemory, storyCopy.monitorImageMetaMemory]
        };

        set({ session: imageSession, isReplying: false, isTaTyping: true });
        persistSession(imageSession);

        await streamTaReplyLines([storyCopy.monitorImageLine], "glitch", {
          waitBeforeFirstLine: true
        });
      })();
      return;
    }

    if (triggerEvaluation.events.includes("location_ping")) {
      void (async () => {
        await waitForTaLineDelay();

        const finalSession = {
          ...get().session,
          chatHistory: [...get().session.chatHistory, createLocationNotice()],
          metaMemory: [...get().session.metaMemory, "第二十八次对话后，最后一句被改成了“你在哪？”。"]
        };

        set({ session: finalSession, isReplying: false, isTaTyping: false });
        persistSession(finalSession);
        flushPendingQueue();
      })();
      return;
    }

    const replyKind = pollution ? "glitch" : "normal";
    const replyContextSession: SessionState = {
      ...nextSession
    };
    const replyLines = await buildReply({
      session: replyContextSession,
      originalInput: userInput,
      pollutedInput: pollution?.pollutedText ?? userInput,
      triggerKeyword: triggerEvaluation.keyword,
      triggerReason: triggerEvaluation.triggerReason,
      events
    });

    if (deferredSystemNotice) {
      const sessionWithNotice = {
        ...get().session,
        chatHistory: [...get().session.chatHistory, deferredSystemNotice]
      };
      set({ session: sessionWithNotice });
      persistSession(sessionWithNotice);
    }

    await streamTaReplyLines(replyLines, replyKind, {
      waitBeforeFirstLine: true
    });
  },

  rollbackToMessage: (messageId) => {
    if (get().isReplying || get().isTaTyping) {
      return;
    }

    const session = get().session;
    if (session.loadCount >= 3) {
      throw new Error(rollbackCopy.limitError);
    }
    const persisted = storageRepository.read();
    const snapshot = createSnapshotFromMessage(session, messageId);
    const result = restoreFromMessage(session, persisted, snapshot);
    set({ session: result.nextSession, isReplying: true, isTaTyping: true });
    storageRepository.write(result.nextPersistedState);
    persistSession(result.nextSession);

    void (async () => {
      await streamTaReplyLines(result.replyLines, result.replyKind ?? "warning", {
        waitBeforeFirstLine: true
      });
    })();
  },

  completeLocationReveal: () => {
    set((state) => {
      const clearedMetaMemory = state.session.metaMemory.filter(
        (entry) =>
          ![
            "定位结尾第一句已触发。",
            "定位结尾第二句已触发。",
            "定位结尾第三句已触发。",
            "定位结尾已进入真相页。"
          ].includes(entry)
      );
      const nextSession = {
        ...state.session,
        stage: "location_aftermath" as const,
        metaMemory: [...clearedMetaMemory, "看完定位图后，定位页已被关闭。"]
      };

      persistSession(nextSession);
      return { session: nextSession };
    });
  },

  sendLocationTurnBack: () => {
    set((state) => {
      if (state.session.metaMemory.includes("定位结尾第一句已触发。")) {
        return state;
      }

      const nextSession = {
        ...state.session,
        chatHistory: [
          ...state.session.chatHistory,
          createChatMessage("ta", storyCopy.locationRevealLine, { kind: "glitch" })
        ],
        metaMemory: [...state.session.metaMemory, "定位结尾第一句已触发。"]
      };

      persistSession(nextSession);
      return { session: nextSession };
    });
  },

  revealLocationLie: () => {
    set((state) => {
      if (state.session.metaMemory.includes("定位结尾第二句已触发。")) {
        return state;
      }

      const nextSession = {
        ...state.session,
        chatHistory: [
          ...state.session.chatHistory,
          createChatMessage("ta", storyCopy.locationRevealLieLine, { kind: "glitch" })
        ],
        metaMemory: [...state.session.metaMemory, "定位结尾第二句已触发。"]
      };

      persistSession(nextSession);
      return { session: nextSession };
    });
  },

  revealLocationOmnipresence: () => {
    set((state) => {
      if (state.session.metaMemory.includes("定位结尾第三句已触发。")) {
        return state;
      }

      const nextSession = {
        ...state.session,
        chatHistory: [
          ...state.session.chatHistory,
          createChatMessage("ta", storyCopy.locationRevealOmnipresenceLine, { kind: "glitch" })
        ],
        metaMemory: [...state.session.metaMemory, "定位结尾第三句已触发。"]
      };

      persistSession(nextSession);
      return { session: nextSession };
    });
  },

  visitSpace: () => {
    set((state) => {
      const nextCount = state.session.spaceVisitCount + 1;
      const nextSession = {
        ...state.session,
        spaceVisitCount: nextCount,
        metaMemory:
          nextCount >= 2
            ? [...state.session.metaMemory, "朋友圈里出现了不属于你的动态。"]
            : state.session.metaMemory
      };

      persistSession(nextSession);
      return { session: nextSession };
    });
  },

  exitAttempt: async () => {
    if (get().isReplying || get().isTaTyping) {
      return;
    }

    const session = get().session;
    const nextCount = session.exitClickCount + 1;
    const replyLines =
      nextCount === 1
        ? exitCopy.firstReplyLines
        : nextCount === 2
          ? exitCopy.secondReplyLines
          : exitCopy.lateReplyLines;
    const nextSession = {
      ...session,
      exitClickCount: nextCount,
      metaMemory: nextCount >= 2 ? [...session.metaMemory, exitCopy.repeatedExitMetaMemory] : session.metaMemory
    };

    persistSession(nextSession);
    set({ session: nextSession, isReplying: true, isTaTyping: true });
    await streamTaReplyLines(replyLines, nextCount >= 2 ? "glitch" : "warning", {
      waitBeforeFirstLine: true
    });
  },

  enterTruthReveal: () => {
    set((state) => {
      const nextSession = {
        ...state.session,
        stage: "truth_reveal" as const
      };
      persistSession(nextSession);
      return {
        session: nextSession
      };
    });
  },

  completeTruth: () => {
    set((state) => {
      const nextSession = {
        ...state.session,
        stage: "wake_up" as const
      };
      persistSession(nextSession);
      return {
        session: nextSession
      };
    });
  },

  finishWakeUp: () => {
    set((state) => {
      const nextSession = {
        ...state.session,
        stage: "translator_unlocked" as const,
        hasFinishedGame: true,
        endingType: state.session.endingType ?? resolveEndingType(state.session)
      };

      persistSession(nextSession, { hasFinishedGame: true });
      return { session: nextSession };
    });
  },

  resetForReplay: () => {
    resetPendingDeletedDraft();
    const persisted = storageRepository.read();
    set({
      isReplying: false,
      isTaTyping: false,
      pendingUserMessages: [],
      session: (() => {
        const nextSession = {
        ...createEmptySession(),
        hasFinishedGame: persisted.hasFinishedGame,
        loadCount: 0,
        metaMemory: [...persisted.metaMemory],
        shareCardData: persisted.shareCardData
        };
        persistSession(nextSession);
        return nextSession;
      })()
    });
  },

  patchSession: (patch) => {
    set((state) => {
      const nextSession = {
        ...state.session,
        ...patch
      };
      persistSession(nextSession);
      if ("shareCardData" in patch && patch.shareCardData) {
        storageRepository.saveLatestShareCard(patch.shareCardData);
      }
      return { session: nextSession };
    });
  },

  saveTranslatorReport: (report) => {
    set((state) => {
      const nextSession = {
        ...state.session,
        translatorReport: report
      };
      persistSession(nextSession);
      return { session: nextSession };
    });
  },

  saveShareCardData: (data) => {
    set((state) => {
      const nextSession = {
        ...state.session,
        shareCardData: data
      };
      storageRepository.saveLatestShareCard(data);
      persistSession(nextSession);
      return { session: nextSession };
    });
  },

  getExitLabel: () => createExitLabel(get().session.exitClickCount),
  getSpaceLabel: () => createSpaceLabel(get().session.spaceVisitCount)
  };
});
