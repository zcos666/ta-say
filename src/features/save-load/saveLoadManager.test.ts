import { describe, expect, it } from "vitest";
import { createAutoSaveSnapshot, restoreFromAutoSave } from "./saveLoadManager";
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
    session.fearType = "害怕说真话";
    session.taPronoun = "TA";
    session.stage = "first_pollution";
    session.chatHistory = [createChatMessage("ta", "hello")];
    session.deletedDrafts = ["我其实很在意"];
    session.deletedDraftCount = 1;

    const snapshot = createAutoSaveSnapshot(session);
    session.chatHistory.push(createChatMessage("system", "after snapshot"));

    const result = restoreFromAutoSave(
      session,
      createPersistedState({ autoSaveSnapshot: snapshot })
    );

    expect(result.kind).toBe("restored");
    expect(result.nextSession.deletedDrafts).toEqual(["我其实很在意"]);
    expect(result.nextSession.loadCount).toBe(1);
    expect(
      result.nextSession.chatHistory.some((message) => message.displayedText.includes("读档成功"))
    ).toBe(true);
  });

  it("第三次读档不恢复快照，直接进入 meta_break", () => {
    const session = createEmptySession();
    session.stage = "normal_chat";
    const snapshot = createAutoSaveSnapshot(session);

    const result = restoreFromAutoSave(
      session,
      createPersistedState({ autoSaveSnapshot: snapshot, loadCount: 2, metaMemory: ["old"] })
    );

    expect(result.kind).toBe("failed");
    expect(result.nextSession.stage).toBe("meta_break");
    expect(result.nextSession.metaMemory[result.nextSession.metaMemory.length - 1]).toBe("存档开始拒绝你了。");
  });
});
