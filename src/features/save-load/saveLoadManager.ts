import { createChatMessage, type PersistedState, type SessionSnapshot, type SessionState } from "../../types/session";

export interface SaveLoadResult {
  nextSession: SessionState;
  nextPersistedState: PersistedState;
  kind: "restored" | "warning" | "failed" | "empty";
}

export function createAutoSaveSnapshot(session: SessionState): SessionSnapshot {
  return {
    fearType: session.fearType,
    taPronoun: session.taPronoun,
    stage: session.stage,
    chatHistory: [...session.chatHistory],
    originalInputs: [...session.originalInputs],
    pollutedInputs: [...session.pollutedInputs],
    triggeredKeywords: [...session.triggeredKeywords],
    pollutionCount: session.pollutionCount,
    sendCount: session.sendCount,
    activeTimedPollution: session.activeTimedPollution
  };
}

export function getLoadButtonLabel(loadCount: number): string {
  if (loadCount >= 3) {
    return "TA已读取上个存档";
  }

  if (loadCount >= 2) {
    return "读档失败";
  }

  return "读档";
}

export function restoreFromAutoSave(
  session: SessionState,
  persistedState: PersistedState
): SaveLoadResult {
  const nextLoadCount = persistedState.loadCount + 1;
  const snapshot = persistedState.autoSaveSnapshot;

  if (!snapshot) {
    const nextSession = {
      ...session,
      loadCount: nextLoadCount,
      chatHistory: [
        ...session.chatHistory,
        createChatMessage("system", "你试着回档，但这里还没有能回去的地方。", { kind: "warning" })
      ]
    };

    return {
      nextSession,
      nextPersistedState: {
        ...persistedState,
        loadCount: nextLoadCount
      },
      kind: "empty"
    };
  }

  if (nextLoadCount >= 3) {
    const nextSession = {
      ...session,
      loadCount: nextLoadCount,
      stage: "meta_break" as const,
      metaMemory: [...persistedState.metaMemory, "存档开始拒绝你了。"],
      chatHistory: [
        ...session.chatHistory,
        createChatMessage("system", "存档点闪了一下，然后自己关上了。", { kind: "glitch" })
      ]
    };

    return {
      nextSession,
      nextPersistedState: {
        ...persistedState,
        loadCount: nextLoadCount,
        metaMemory: nextSession.metaMemory
      },
      kind: "failed"
    };
  }

  const preservedMetaMemory = [
    ...persistedState.metaMemory,
    nextLoadCount === 1 ? "你成功回到异常出现前。" : "你回去了，但 TA 也一起回去了。"
  ];

  const nextSession: SessionState = {
    ...session,
    fearType: snapshot.fearType,
    taPronoun: snapshot.taPronoun,
    stage: nextLoadCount === 1 ? "save_loaded_once" : "save_loaded_twice",
    chatHistory: [
      ...snapshot.chatHistory,
      createChatMessage(
        "system",
        nextLoadCount === 1 ? "读档成功。你短暂回到了第一次失真之前。" : "读档成功，但异常没有一起消失。",
        { kind: nextLoadCount === 1 ? "warning" : "glitch" }
      )
    ],
    originalInputs: [...snapshot.originalInputs],
    pollutedInputs: [...snapshot.pollutedInputs],
    triggeredKeywords: [...snapshot.triggeredKeywords],
    pollutionCount: snapshot.pollutionCount,
    sendCount: snapshot.sendCount,
    activeTimedPollution: snapshot.activeTimedPollution,
    loadCount: nextLoadCount,
    deletedDrafts: [...session.deletedDrafts],
    deletedDraftCount: session.deletedDraftCount,
    metaMemory: preservedMetaMemory,
    spaceVisitCount: session.spaceVisitCount,
    exitClickCount: session.exitClickCount,
    hasFinishedGame: session.hasFinishedGame,
    endingType: session.endingType,
    translatorReport: session.translatorReport,
    shareCardData: session.shareCardData
  };

  return {
    nextSession,
    nextPersistedState: {
      ...persistedState,
      loadCount: nextLoadCount,
      metaMemory: preservedMetaMemory
    },
    kind: nextLoadCount === 1 ? "restored" : "warning"
  };
}
