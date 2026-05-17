import { createChatMessage, type ChatMessage, type PersistedState, type SessionSnapshot, type SessionState } from "../../types/session";
import { rollbackCopy } from "../../config/hardcodedCopy";

export interface SaveLoadResult {
  nextSession: SessionState;
  nextPersistedState: PersistedState;
  kind: "restored" | "warning" | "failed" | "empty";
  replyLines: string[];
  replyKind?: "warning" | "glitch";
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

function inferStageFromHistory(messages: ChatMessage[]): SessionState["stage"] {
  const userMessages = messages.filter((message) => message.role === "user");
  const pollutedMessages = userMessages.filter((message) => Boolean(message.originalText));
  const hasDraftExposure = messages.some(
    (message) => message.role === "system" && message.displayedText.includes("输入框刚刚替你记住了")
  );

  if (hasDraftExposure) {
    return "draft_exposed";
  }

  if (pollutedMessages.length > 0) {
    return "first_pollution";
  }

  if (userMessages.length >= 2) {
    return "normal_chat";
  }

  return "intro";
}

function inferForcedPollutionRemaining(sendCount: number, pollutionCount: number): number {
  if (sendCount < 3 || pollutionCount >= 5) {
    return 0;
  }

  return Math.max(0, 5 - pollutionCount);
}

export function createSnapshotFromMessage(session: SessionState, messageId: string): SessionSnapshot | null {
  const targetIndex = session.chatHistory.findIndex((message) => message.id === messageId);

  if (targetIndex < 0) {
    return null;
  }

  const chatHistory = session.chatHistory.slice(0, targetIndex + 1);
  const userMessages = chatHistory.filter((message) => message.role === "user");
  const pollutedMessages = userMessages.filter((message) => Boolean(message.originalText));

  return {
    taPronoun: session.taPronoun,
    stage: inferStageFromHistory(chatHistory),
    chatHistory,
    originalInputs: userMessages.map((message) => message.originalText ?? message.displayedText),
    pollutedInputs: pollutedMessages.map((message) => message.displayedText),
    triggeredKeywords: [...session.triggeredKeywords],
    pollutionCount: pollutedMessages.length,
    sendCount: userMessages.length,
    forcedPollutionRemaining: inferForcedPollutionRemaining(userMessages.length, pollutedMessages.length),
    activeTimedPollution: false
  };
}

export function restoreFromMessage(
  session: SessionState,
  persistedState: PersistedState,
  snapshot: SessionSnapshot | null
): SaveLoadResult {
  const nextLoadCount = persistedState.loadCount + 1;

  if (!snapshot) {
    const nextSession = {
      ...session,
      loadCount: nextLoadCount,
      chatHistory: [
        ...session.chatHistory,
        createChatMessage("system", rollbackCopy.emptyTargetSystemNotice, { kind: "warning" })
      ]
    };

    return {
      nextSession,
      nextPersistedState: {
        ...persistedState,
        loadCount: nextLoadCount
      },
      kind: "empty",
      replyLines: []
    };
  }

  if (nextLoadCount >= 3) {
    const nextSession = {
      ...session,
      loadCount: nextLoadCount,
      metaMemory: [...persistedState.metaMemory, "你以为只有你在读档。"],
      chatHistory: [
        ...session.chatHistory,
        createChatMessage("system", rollbackCopy.blockedSystemNotice, { kind: "glitch" })
      ]
    };

    return {
      nextSession,
      nextPersistedState: {
        ...persistedState,
        loadCount: nextLoadCount,
        metaMemory: nextSession.metaMemory
      },
      kind: "failed",
      replyLines: [...rollbackCopy.thirdReplyLines],
      replyKind: "glitch"
    };
  }

  const preservedMetaMemory = [
    ...persistedState.metaMemory,
    nextLoadCount === 1 ? "你成功回到异常出现前。" : "你回去了，但 TA 也一起回去了。"
  ];

  const nextSession: SessionState = {
    ...session,
    taPronoun: snapshot.taPronoun,
    stage: nextLoadCount === 1 ? "save_loaded_once" : "save_loaded_twice",
    chatHistory: [
      ...snapshot.chatHistory,
      createChatMessage(
        "system",
        nextLoadCount === 1 ? rollbackCopy.firstSuccessSystemNotice : rollbackCopy.secondSuccessSystemNotice,
        { kind: nextLoadCount === 1 ? "warning" : "glitch" }
      )
    ],
    originalInputs: [...snapshot.originalInputs],
    pollutedInputs: [...snapshot.pollutedInputs],
    triggeredKeywords: [...snapshot.triggeredKeywords],
    pollutionCount: snapshot.pollutionCount,
    sendCount: snapshot.sendCount,
    forcedPollutionRemaining: snapshot.forcedPollutionRemaining,
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
    kind: nextLoadCount === 1 ? "restored" : "warning",
    replyLines:
      nextLoadCount === 1
        ? [...rollbackCopy.firstReplyLines]
        : [...rollbackCopy.secondReplyLines],
    replyKind: nextLoadCount === 1 ? "warning" : "glitch"
  };
}
