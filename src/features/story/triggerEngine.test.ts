import { describe, expect, it } from "vitest";
import { evaluateTriggers } from "./triggerEngine";
import { createChatMessage, createEmptySession } from "../../types/session";

describe("evaluateTriggers", () => {
  it("第三次发送时强制触发首次污染", () => {
    const session = createEmptySession();
    session.stage = "normal_chat";

    const result = evaluateTriggers(session, "嗯", 3);

    expect(result.triggerReason).toBe("count");
    expect(result.shouldPollute).toBe(true);
  });

  it("连续污染窗口内继续强制污染", () => {
    const session = createEmptySession();
    session.stage = "first_pollution";
    session.sendCount = 3;
    session.pollutionCount = 1;
    session.forcedPollutionRemaining = 4;

    const result = evaluateTriggers(session, "继续说", 4);

    expect(result.triggerReason).toBe("scripted");
    expect(result.shouldPollute).toBe(true);
  });

  it("前五次连续污染结束后，不再自动进入脚本污染循环", () => {
    const session = createEmptySession();
    session.stage = "first_pollution";
    session.sendCount = 8;
    session.pollutionCount = 5;
    session.forcedPollutionRemaining = 0;

    const result = evaluateTriggers(session, "今天吃了什么", 9);

    expect(result.triggerReason).toBeUndefined();
    expect(result.shouldPollute).toBe(false);
  });

  it("即使旧会话里残留 activeTimedPollution，后续发送也不会继续被污染", () => {
    const session = createEmptySession();
    session.stage = "first_pollution";
    session.sendCount = 8;
    session.pollutionCount = 5;
    session.forcedPollutionRemaining = 0;
    session.activeTimedPollution = true;

    const result = evaluateTriggers(session, "这句应该正常发出去", 9);

    expect(result.triggerReason).toBeUndefined();
    expect(result.shouldPollute).toBe(false);
    expect(result.startTimedWindow).toBe(false);
  });

  it("长句里夹带高频口语词时，不会在后段被误判成关键词污染", () => {
    const session = createEmptySession();
    session.stage = "first_pollution";
    session.sendCount = 8;
    session.pollutionCount = 5;
    session.forcedPollutionRemaining = 0;

    const result = evaluateTriggers(session, "好吧那我们晚上再聊，我先去吃饭", 9);

    expect(result.triggerReason).toBeUndefined();
    expect(result.shouldPollute).toBe(false);
  });

  it("空间和退出累计状态不会作为常驻事件反复传给模型", () => {
    const session = createEmptySession();
    session.spaceVisitCount = 2;
    session.exitClickCount = 1;

    const result = evaluateTriggers(session, "继续说", 5);

    expect(result.events).not.toContain("space_glitch");
    expect(result.events).not.toContain("exit_blocked");
  });

  it("总对话数达到 28 时触发定位结尾事件", () => {
    const session = createEmptySession();
    session.stage = "normal_chat";
    session.chatHistory = Array.from({ length: 27 }, (_, index) =>
      createChatMessage(index % 2 === 0 ? "ta" : "user", `message-${index + 1}`)
    );

    const result = evaluateTriggers(session, "最后一句", 9);

    expect(result.triggerReason).toBe("scripted");
    expect(result.shouldPollute).toBe(true);
    expect(result.events).toContain("location_ping");
    expect(result.enterLocationReveal).toBe(true);
  });
});
