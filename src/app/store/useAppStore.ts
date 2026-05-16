import { create } from "zustand";
import { captureDeletedDraft } from "../../features/drafts/draftMonitor";
import { buildPollutionResult } from "../../features/pollution/pollutionEngine";
import { buildReply } from "../../features/reply/replyEngine";
import {
  createAutoSaveSnapshot,
  getLoadButtonLabel,
  restoreFromAutoSave
} from "../../features/save-load/saveLoadManager";
import { resolveEndingType } from "../../features/story/endingResolver";
import { getFearFallbackCopy } from "../../features/story/stageConfig";
import { deriveNextStage } from "../../features/story/stateMachine";
import { evaluateTriggers } from "../../features/story/triggerEngine";
import { storageRepository } from "../../services/storage/storageRepository";
import {
  createChatMessage,
  createEmptySession,
  type PersistedState,
  type SessionState
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

function syncPersistentState(session: SessionState, overrides: Partial<PersistedState> = {}) {
  const current = storageRepository.read();
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
    return "已经来不及了";
  }

  if (exitClickCount >= 1) {
    return "别留我一个";
  }

  return "退出";
}

function createSpaceLabel(spaceVisitCount: number): string {
  if (spaceVisitCount >= 2) {
    return "你的空间";
  }

  return "空间";
}

interface AppStore {
  hydrated: boolean;
  isReplying: boolean;
  session: SessionState;
  hydrate: () => void;
  selectSetup: (fearType: FearType, taPronoun: TaPronoun) => Promise<void>;
  updateDraft: (previousValue: string, nextValue: string) => void;
  sendMessage: (input: string) => Promise<void>;
  loadGame: () => Promise<void>;
  visitSpace: () => void;
  exitAttempt: () => Promise<void>;
  enterTruthReveal: () => void;
  completeTruth: () => void;
  finishWakeUp: () => void;
  resetForReplay: () => void;
  getLoadLabel: () => string;
  getExitLabel: () => string;
  getSpaceLabel: () => string;
}

function createTaMessages(lines: string[], kind: "normal" | "warning" | "glitch") {
  return lines.map((line) => createChatMessage("ta", line, { kind }));
}

export const useAppStore = create<AppStore>((set, get) => ({
  hydrated: false,
  isReplying: false,
  session: createEmptySession(),

  hydrate: () => {
    const persisted = storageRepository.read();
    set({
      hydrated: true,
      session: withPersistentFields(createEmptySession(), persisted)
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

    const replyLines = await buildReply({
      session: nextSession
    });

    set({
      session: {
        ...nextSession,
        chatHistory: [...nextSession.chatHistory, ...createTaMessages(replyLines, "normal")]
      },
      isReplying: false
    });
  },

  updateDraft: (previousValue, nextValue) => {
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
        deletedDrafts: [...state.session.deletedDrafts, deletedDraft],
        deletedDraftCount: state.session.deletedDraftCount + 1
      };

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
    const persisted = storageRepository.read();

    if (!persisted.autoSaveSnapshot && nextSendCount === 3) {
      storageRepository.patch({
        autoSaveSnapshot: createAutoSaveSnapshot(session)
      });
    }

    const triggerEvaluation = evaluateTriggers(session, userInput, nextSendCount);
    const pollution = buildPollutionResult({
      userInput,
      stage: session.stage,
      fearType: session.fearType,
      triggerReason: triggerEvaluation.triggerReason,
      keyword: triggerEvaluation.keyword
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
            session.deletedDrafts[session.deletedDrafts.length - 1] ?? getFearFallbackCopy(session.fearType)
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
        set((current) => ({
          session: {
            ...current.session,
            activeTimedPollution: false,
            stage: current.session.stage === "time_pollution" ? "normal_chat" : current.session.stage
          }
        }));
      }, 30000);
    }

    set({ session: nextSession, isReplying: true });
    syncPersistentState(nextSession);

    const replyLines = await buildReply({
      session: nextSession,
      originalInput: userInput,
      pollutedInput: pollution?.pollutedText ?? userInput,
      triggerReason: triggerEvaluation.triggerReason,
      events
    });

    const finalSession = {
      ...nextSession,
      chatHistory: [
        ...nextSession.chatHistory,
        ...createTaMessages(replyLines, pollution ? "glitch" : "normal")
      ]
    };

    set({ session: finalSession, isReplying: false });
    syncPersistentState(finalSession);
  },

  loadGame: async () => {
    if (get().isReplying) {
      return;
    }

    const session = get().session;
    const persisted = storageRepository.read();
    const result = restoreFromAutoSave(session, persisted);
    set({
      session: result.nextSession,
      isReplying: result.kind === "restored" || result.kind === "warning" || result.kind === "failed"
    });
    storageRepository.write(result.nextPersistedState);

    if (result.kind === "empty") {
      set({ isReplying: false });
      return;
    }

    const events: StoryEvent[] =
      result.kind === "failed"
        ? ["load_failed"]
        : result.kind === "warning"
          ? ["load_warning"]
          : ["load_restored"];
    const replyLines = await buildReply({
      session: result.nextSession,
      events
    });
    const finalSession = {
      ...result.nextSession,
      chatHistory: [
        ...result.nextSession.chatHistory,
        ...createTaMessages(replyLines, result.kind === "restored" ? "warning" : "glitch")
      ]
    };

    set({ session: finalSession, isReplying: false });
  },

  visitSpace: () => {
    set((state) => {
      const nextCount = state.session.spaceVisitCount + 1;
      const nextStage = nextCount >= 3 ? "meta_break" : state.session.stage;
      const nextSession = {
        ...state.session,
        stage: nextStage,
        spaceVisitCount: nextCount,
        metaMemory:
          nextCount >= 2
            ? [...state.session.metaMemory, "空间里出现了不属于你的动态。"]
            : state.session.metaMemory
      };

      syncPersistentState(nextSession);
      return { session: nextSession };
    });
  },

  exitAttempt: async () => {
    if (get().isReplying) {
      return;
    }

    const session = get().session;
    const nextCount = session.exitClickCount + 1;
    const shouldBreak = nextCount >= 3;
    const nextSession = {
      ...session,
      exitClickCount: nextCount,
      stage: shouldBreak ? "meta_break" : session.stage,
      metaMemory: nextCount >= 2 ? [...session.metaMemory, "退出按钮也开始参与叙事。"] : session.metaMemory
    };

    syncPersistentState(nextSession);
    set({ session: nextSession, isReplying: true });

    const replyLines = await buildReply({
      session: nextSession,
      originalInput: "我要退出",
      events: ["exit_blocked"]
    });
    const finalSession = {
      ...nextSession,
      chatHistory: [
        ...nextSession.chatHistory,
        ...createTaMessages(replyLines, nextCount >= 2 ? "glitch" : "warning")
      ]
    };

    set({ session: finalSession, isReplying: false });
  },

  enterTruthReveal: () => {
    set((state) => ({
      session: {
        ...state.session,
        stage: "truth_reveal"
      }
    }));
  },

  completeTruth: () => {
    set((state) => ({
      session: {
        ...state.session,
        stage: "wake_up"
      }
    }));
  },

  finishWakeUp: () => {
    set((state) => {
      const nextSession = {
        ...state.session,
        stage: "translator_unlocked" as const,
        hasFinishedGame: true,
        endingType: state.session.endingType ?? resolveEndingType(state.session)
      };

      syncPersistentState(nextSession, { hasFinishedGame: true });
      return { session: nextSession };
    });
  },

  resetForReplay: () => {
    const persisted = storageRepository.read();
    set({
      session: {
        ...createEmptySession(),
        hasFinishedGame: persisted.hasFinishedGame,
        loadCount: persisted.loadCount,
        metaMemory: [...persisted.metaMemory],
        shareCardData: persisted.shareCardData
      }
    });
  },

  getLoadLabel: () => getLoadButtonLabel(get().session.loadCount),
  getExitLabel: () => createExitLabel(get().session.exitClickCount),
  getSpaceLabel: () => createSpaceLabel(get().session.spaceVisitCount)
}));
