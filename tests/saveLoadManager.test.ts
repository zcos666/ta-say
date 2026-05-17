import { describe, expect, it } from "vitest";
import { createChatMessage, type PersistedState, type SessionState } from "../src/types/session";
import { createSnapshotFromMessage, restoreFromMessage } from "../src/features/save-load/saveLoadManager";

function createBaseSession(): SessionState {
  const taIntro = createChatMessage("ta", "醒了吗？");
  const userFirst = createChatMessage("user", "早。");
  const taReply = createChatMessage("ta", "我在。");
  const userSecond = createChatMessage("user", "没事，你忙吧。", {
    originalText: "没事，你忙吧。",
    kind: "polluted",
  });

  return {
    taPronoun: "TA",
    stage: "first_pollution",
    chatHistory: [taIntro, userFirst, taReply, userSecond],
    originalInputs: ["早。", "没事，你忙吧。"],
    pollutedInputs: ["我很介意。"],
    triggeredKeywords: ["没事"],
    deletedDrafts: [],
    metaMemory: [],
    pollutionCount: 1,
    deletedDraftCount: 0,
    loadCount: 0,
    sendCount: 2,
    spaceVisitCount: 0,
    exitClickCount: 0,
    activeTimedPollution: false,
    hasFinishedGame: false,
    endingType: null,
    hardestSentence: "",
  };
}

function createPersistedState(loadCount: number): PersistedState {
  return {
    hasFinishedGame: false,
    loadCount,
    metaMemory: [],
    version: 2,
  };
}

describe("saveLoadManager rollback flow", () => {
  it("第一次回退成功并回到所选消息之前的版本", () => {
    const session = createBaseSession();
    const targetMessage = session.chatHistory[1];
    const snapshot = createSnapshotFromMessage(session, targetMessage.id);
    const result = restoreFromMessage(session, createPersistedState(0), snapshot);

    expect(result.kind).toBe("restored");
    expect(result.nextSession.loadCount).toBe(1);
    expect(result.nextSession.stage).toBe("save_loaded_once");
    expect(result.nextSession.chatHistory[0]?.displayedText).toBe("醒了吗？");
    expect(result.nextSession.chatHistory[1]?.displayedText).toBe("早。");
    expect(result.replyLines).toEqual(["我们是不是聊过这个？"]);
  });

  it("第三次回退不会进入 meta_break，而是返回 PRD 固定文案", () => {
    const session = createBaseSession();
    const targetMessage = session.chatHistory[1];
    const snapshot = createSnapshotFromMessage(session, targetMessage.id);
    const result = restoreFromMessage(session, createPersistedState(2), snapshot);

    expect(result.kind).toBe("failed");
    expect(result.nextSession.stage).toBe("first_pollution");
    expect(result.replyLines).toEqual(["你出不去了。", "你以为只有你在读档？", "我一直在读你。"]);
  });
});
