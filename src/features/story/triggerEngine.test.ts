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

  it("在空间和退出异常达到阈值后发出对应事件", () => {
    const session = createEmptySession();
    session.spaceVisitCount = 2;
    session.exitClickCount = 1;

    const result = evaluateTriggers(session, "继续说", 5);

    expect(result.events).toContain("space_glitch");
    expect(result.events).toContain("exit_blocked");
  });
});
