import { describe, expect, it } from "vitest";
import { createChatMessage, createEmptySession, type SessionState } from "../src/types/session";
import { evaluateTriggers } from "../src/features/story/triggerEngine";

function createSession(overrides: Partial<SessionState> = {}): SessionState {
  return {
    ...createEmptySession(),
    taPronoun: "TA",
    stage: "normal_chat",
    ...overrides,
  };
}

describe("triggerEngine PRD rules", () => {
  it("第 3 次发送必定触发第一次污染", () => {
    const session = createSession({ sendCount: 2 });
    const result = evaluateTriggers(session, "普通一句话", 3);

    expect(result.triggerReason).toBe("count");
    expect(result.shouldPollute).toBe(true);
  });

  it("第三次之后会继续进入至少五次连续污染窗口", () => {
    const session = createSession({
      sendCount: 3,
      pollutionCount: 1,
      forcedPollutionRemaining: 4,
    });

    const result = evaluateTriggers(session, "普通一句话", 4);

    expect(result.triggerReason).toBe("scripted");
    expect(result.shouldPollute).toBe(true);
  });

  it("连续五次之后进入部分污染阶段", () => {
    const session = createSession({
      sendCount: 7,
      pollutionCount: 5,
      forcedPollutionRemaining: 0,
    });

    const result = evaluateTriggers(session, "普通一句话", 8);

    expect(result.triggerReason).toBe("scripted");
    expect(result.shouldPollute).toBe(true);
  });

  it("总对话数达到 20 时先触发定位结尾而不是直接进入 meta_break", () => {
    const almostDoneHistory = Array.from({ length: 19 }, (_, index) =>
      createChatMessage(index % 2 === 0 ? "user" : "ta", `msg-${index + 1}`)
    );
    const session = createSession({
      chatHistory: almostDoneHistory,
      loadCount: 9,
      spaceVisitCount: 5,
      exitClickCount: 4,
    });

    const result = evaluateTriggers(session, "最后一句", 10);

    expect(result.enterMetaBreak).toBe(false);
    expect(result.enterLocationReveal).toBe(true);
    expect(result.events).toContain("location_ping");
  });

  it("读档、空间和退出次数本身不会触发 meta_break", () => {
    const shortHistory = [createChatMessage("ta", "hi"), createChatMessage("user", "hello")];
    const session = createSession({
      chatHistory: shortHistory,
      loadCount: 9,
      spaceVisitCount: 5,
      exitClickCount: 4,
    });

    const result = evaluateTriggers(session, "继续聊", 2);

    expect(result.enterMetaBreak).toBe(false);
  });
});
