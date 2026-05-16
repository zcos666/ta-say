import { create } from "zustand";
import { captureDeletedDraft } from "../../features/drafts/draftMonitor";
import { buildPollutionResult } from "../../features/pollution/pollutionEngine";
import { buildReply } from "../../features/reply/replyEngine";
import { draftCopy, rollbackCopy, storyCopy, uiCopy } from "../../config/hardcodedCopy";
import {
  createSnapshotFromMessage,
  restoreFromMessage
} from "../../features/save-load/saveLoadManager";
import { resolveEndingType } from "../../features/story/endingResolver";
import { deriveNextStage } from "../../features/story/stateMachine";
import { evaluateTriggers } from "../../features/story/triggerEngine";
import { storageRepository } from "../../services/storage/storageRepository";
import type { LoveTranslationReport } from "../../types/api";
import {
  createChatMessage,
  createEmptySession,
  type PersistedState,
  type SessionState,
  type ShareCardData
} from "../../types/session";
import type { FearType, StoryEvent, TaPronoun } from "../../types/story";

let timedPollutionTimer: number | undefined;

function withPersistentFields(session: SessionState, persisted: PersistedState): SessionState {
  return {
    ...session,
    hasFinishedGame: persisted.hasFinishedGame,
    loadCount: persisted.loadCount,
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
  session: SessionState;
  hydrate: () => void;
  selectSetup: (fearType: FearType, taPronoun: TaPronoun) => Promise<void>;
  updateDraft: (
    previousValue: string,
    nextValue: string,
    options?: { isDeleting?: boolean; isComposing?: boolean }
  ) => void;
  sendMessage: (input: string) => Promise<void>;
  rollbackToMessage: (messageId: string) => void;
  completeLocationReveal: () => void;
  revealLocationLie: () => void;
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
  return 1000 + Math.floor(Math.random() * 2001);
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

export const useAppStore = create<AppStore>((set, get) => ({
  hydrated: false,
  isReplying: false,
  session: createEmptySession(),

  // no-op placeholder to satisfy method ordering in returned object

  hydrate: () => {
    set({
      hydrated: true,
      session: hydrateSessionFromStorage()
    });
  },

  selectSetup: async (fearType, taPronoun) => {
    const persisted = storageRepository.read();
    const nextSession = withPersistentFields(createEmptySession(), persisted);
    nextSession.fearType = fearType;
    nextSession.taPronoun = taPronoun;
    nextSession.stage = "intro";
    nextSession.chatHistory = [];
    set({ session: nextSession, isReplying: true });
    persistSession(nextSession);

    const replyLines = await buildReply({
      session: nextSession
    });

    for (let index = 0; index < replyLines.length; index += 1) {
      const line = replyLines[index];
      const streamedSession = {
        ...get().session,
        chatHistory: [...get().session.chatHistory, createChatMessage("ta", line, { kind: "normal" })]
      };

      set({ session: streamedSession });
      persistSession(streamedSession);

      if (index < replyLines.length - 1) {
        await waitForTaLineDelay();
      }
    }

    const finalSession = {
      ...get().session,
      chatHistory: [...get().session.chatHistory, createIntroSpaceNotice(taPronoun)]
    };

    set({
      session: finalSession,
      isReplying: false
    });
    persistSession(finalSession);
  },

  updateDraft: (previousValue, nextValue, options = {}) => {
    if (options.isComposing || !options.isDeleting) {
      return;
    }

    const deletedDraft = captureDeletedDraft(previousValue, nextValue);

    if (!deletedDraft) {
      return;
    }

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
  },

  sendMessage: async (input) => {
    if (get().isReplying) {
      return;
    }

    const userInput = input.trim();

    if (!userInput) {
      return;
    }

    const session = get().session;
    const nextSendCount = session.sendCount + 1;

    const triggerEvaluation = evaluateTriggers(session, userInput, nextSendCount);
    const pollution = buildPollutionResult({
      userInput,
      stage: session.stage,
      pollutionCount: session.pollutionCount,
      sendCount: nextSendCount,
      triggerReason: triggerEvaluation.triggerReason,
      keyword: triggerEvaluation.keyword,
      events: triggerEvaluation.events
    });
    const events = [...triggerEvaluation.events];
    const userMessage = createChatMessage(
      "user",
      pollution?.pollutedText ?? userInput,
      pollution
        ? {
            originalText: userInput,
            kind: "polluted"
          }
        : undefined
    );
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

    if (triggerEvaluation.events.includes("draft_exposed")) {
      nextSession.chatHistory.push(
        createChatMessage(
          "system",
          `输入框刚刚替你记住了：${
            session.deletedDrafts[session.deletedDrafts.length - 1] ?? "你刚刚那句没发出来的话。"
          }`,
          { kind: "warning" }
        )
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

    set({ session: nextSession, isReplying: true });
    persistSession(nextSession);

    if (triggerEvaluation.events.includes("location_ping")) {
      const finalSession = {
        ...nextSession,
        chatHistory: [
          ...nextSession.chatHistory,
          createLocationNotice()
        ],
        metaMemory: [...nextSession.metaMemory, "第二十次对话后，最后一句被改成了“你在哪？”。"]
      };

      set({ session: finalSession, isReplying: false });
      persistSession(finalSession);
      return;
    }

    const replyLines = await buildReply({
      session: nextSession,
      originalInput: userInput,
      pollutedInput: pollution?.pollutedText ?? userInput,
      triggerReason: triggerEvaluation.triggerReason,
      events
    });

    for (let index = 0; index < replyLines.length; index += 1) {
      const line = replyLines[index];
      const streamedSession = {
        ...get().session,
        chatHistory: [
          ...get().session.chatHistory,
          createChatMessage("ta", line, { kind: pollution ? "glitch" : "normal" })
        ]
      };

      set({ session: streamedSession });
      persistSession(streamedSession);

      if (index < replyLines.length - 1) {
        await waitForTaLineDelay();
      }
    }

    set({ session: get().session, isReplying: false });
  },

  rollbackToMessage: (messageId) => {
    if (get().isReplying) {
      return;
    }

    const session = get().session;
    if (session.loadCount >= 3) {
      throw new Error(rollbackCopy.limitError);
    }
    const persisted = storageRepository.read();
    const snapshot = createSnapshotFromMessage(session, messageId);
    const result = restoreFromMessage(session, persisted, snapshot);
    set({ session: result.nextSession, isReplying: true });
    storageRepository.write(result.nextPersistedState);
    persistSession(result.nextSession);

    void (async () => {
      for (let index = 0; index < result.replyLines.length; index += 1) {
        const line = result.replyLines[index];
        const streamedSession = {
          ...get().session,
          chatHistory: [
            ...get().session.chatHistory,
            createChatMessage("ta", line, { kind: result.replyKind ?? "warning" })
          ]
        };

        set({ session: streamedSession });
        persistSession(streamedSession);

        if (index < result.replyLines.length - 1) {
          await waitForTaLineDelay();
        }
      }

      set({ session: get().session, isReplying: false });
    })();
  },

  completeLocationReveal: () => {
    set((state) => {
      const nextSession = {
        ...state.session,
        stage: "location_aftermath" as const,
        chatHistory: [
          ...state.session.chatHistory,
          createChatMessage("ta", storyCopy.locationRevealLine, { kind: "glitch" })
        ],
        metaMemory: [...state.session.metaMemory, "看完定位图后，TA 让你回头。"]
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

  visitSpace: () => {
    set((state) => {
      const nextCount = state.session.spaceVisitCount + 1;
      const nextSession = {
        ...state.session,
        spaceVisitCount: nextCount,
        metaMemory:
          nextCount >= 2
            ? [...state.session.metaMemory, "空间里出现了不属于你的动态。"]
            : state.session.metaMemory
      };

      persistSession(nextSession);
      return { session: nextSession };
    });
  },

  exitAttempt: async () => {
    if (get().isReplying) {
      return;
    }

    const session = get().session;
    const nextCount = session.exitClickCount + 1;
    const nextSession = {
      ...session,
      exitClickCount: nextCount,
      metaMemory: nextCount >= 2 ? [...session.metaMemory, "退出按钮也开始参与叙事。"] : session.metaMemory
    };

    persistSession(nextSession);
    set({ session: nextSession, isReplying: true });

    const replyLines = await buildReply({
      session: nextSession,
      originalInput: "我要退出",
      events: ["exit_blocked"]
    });

    for (let index = 0; index < replyLines.length; index += 1) {
      const line = replyLines[index];
      const streamedSession = {
        ...get().session,
        chatHistory: [
          ...get().session.chatHistory,
          createChatMessage("ta", line, { kind: nextCount >= 2 ? "glitch" : "warning" })
        ]
      };

      set({ session: streamedSession });
      persistSession(streamedSession);

      if (index < replyLines.length - 1) {
        await waitForTaLineDelay();
      }
    }

    set({ session: get().session, isReplying: false });
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
    const persisted = storageRepository.read();
    set({
      session: (() => {
        const nextSession = {
        ...createEmptySession(),
        hasFinishedGame: persisted.hasFinishedGame,
        loadCount: persisted.loadCount,
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
}));
