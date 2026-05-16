import { describe, expect, it } from "vitest";
import { evaluateTriggers } from "./triggerEngine";
import { createEmptySession } from "../../types/session";

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

  it("在空间和退出异常达到阈值后发出对应事件", () => {
    const session = createEmptySession();
    session.spaceVisitCount = 2;
    session.exitClickCount = 1;

    const result = evaluateTriggers(session, "继续说", 5);

    expect(result.events).toContain("space_glitch");
    expect(result.events).toContain("exit_blocked");
  });

  it("第 20 次发送时触发定位结尾事件", () => {
    const session = createEmptySession();
    session.stage = "normal_chat";
    session.sendCount = 19;

    const result = evaluateTriggers(session, "最后一句", 20);

    expect(result.triggerReason).toBe("scripted");
    expect(result.shouldPollute).toBe(true);
    expect(result.events).toContain("location_ping");
    expect(result.enterLocationReveal).toBe(true);
  });
});
