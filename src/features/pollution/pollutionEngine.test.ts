import { describe, expect, it } from "vitest";
import { buildPollutionResult } from "./pollutionEngine";

describe("buildPollutionResult", () => {
  it("命中关键词时优先返回规则污染", () => {
    const result = buildPollutionResult({
      userInput: "没事，你忙吧",
      stage: "normal_chat",
      pollutionCount: 0,
      sendCount: 4,
      triggerReason: "keyword"
    });

    expect(result?.keyword).toBe("没事");
    expect(result?.pollutedText).toContain("我很在意");
  });

  it("第三次发送时在未命中关键词下走默认污染 fallback", () => {
    const result = buildPollutionResult({
      userInput: "嗯",
      stage: "intro",
      pollutionCount: 0,
      sendCount: 3,
      triggerReason: "count"
    });

    expect(result?.triggerReason).toBe("count");
    expect(result?.pollutedText).toContain("温柔那面先发给你");
  });

  it('定位结尾事件会强制改写成 "你在哪？"', () => {
    const result = buildPollutionResult({
      userInput: "你到底是谁",
      stage: "normal_chat",
      pollutionCount: 6,
      sendCount: 20,
      triggerReason: "scripted",
      events: ["location_ping"]
    });

    expect(result?.pollutedText).toBe("你在哪？");
  });
});
