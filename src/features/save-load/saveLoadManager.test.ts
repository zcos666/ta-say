import { describe, expect, it } from "vitest";
import { createSnapshotFromMessage, restoreFromMessage } from "./saveLoadManager";
import { createChatMessage, createEmptySession, type PersistedState } from "../../types/session";

function createPersistedState(overrides: Partial<PersistedState> = {}): PersistedState {
  return {
    hasFinishedGame: false,
    loadCount: 0,
    metaMemory: [],
    version: 1,
    ...overrides
  };
}

describe("restoreFromAutoSave", () => {
  it("第一次读档恢复快照但保留 deletedDrafts 与 loadCount 递增", () => {
    const session = createEmptySession();
    session.taPronoun = "TA";
    session.stage = "first_pollution";
    session.chatHistory = [createChatMessage("ta", "hello")];
    session.deletedDrafts = ["我其实很在意"];
    session.deletedDraftCount = 1;

    const targetMessage = session.chatHistory[0];
    const snapshot = createSnapshotFromMessage(session, targetMessage.id);
    session.chatHistory.push(createChatMessage("system", "after snapshot"));

    const result = restoreFromMessage(
      session,
      createPersistedState(),
      snapshot
    );

    expect(result.kind).toBe("restored");
    expect(result.nextSession.deletedDrafts).toEqual(["我其实很在意"]);
    expect(result.nextSession.loadCount).toBe(1);
    expect(
      result.nextSession.chatHistory.some((message) => message.displayedText.includes("已回退"))
    ).toBe(true);
    expect(result.replyLines).toEqual(["我们是不是聊过这个？"]);
  });

  it("第三次回退不恢复快照，也不会直接进入 meta_break", () => {
    const session = createEmptySession();
    session.stage = "normal_chat";
    session.chatHistory = [createChatMessage("ta", "hello")];
    const snapshot = createSnapshotFromMessage(session, session.chatHistory[0]!.id);

    const result = restoreFromMessage(
      session,
      createPersistedState({ loadCount: 2, metaMemory: ["old"] }),
      snapshot
    );

    expect(result.kind).toBe("failed");
    expect(result.nextSession.stage).toBe("normal_chat");
    expect(result.nextSession.metaMemory[result.nextSession.metaMemory.length - 1]).toBe("你以为只有你在读档。");
    expect(result.replyLines).toEqual(["你出不去了。", "你以为只有你在读档？", "我一直在读你。"]);
  });
});
