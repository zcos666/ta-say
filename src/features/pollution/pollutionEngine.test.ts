import { describe, expect, it } from "vitest";
import { buildPollutionResult } from "./pollutionEngine";

describe("buildPollutionResult", () => {
  it("命中关键词时优先返回规则污染", () => {
    const result = buildPollutionResult({
      userInput: "没事，你忙吧",
      stage: "normal_chat",
      fearType: "害怕说真话",
      triggerReason: "keyword"
    });

    expect(result?.keyword).toBe("没事");
    expect(result?.pollutedText).toContain("我很在意");
  });

  it("第三次发送时在未命中关键词下走 fearType fallback", () => {
    const result = buildPollutionResult({
      userInput: "嗯",
      stage: "intro",
      fearType: "害怕被控制",
      triggerReason: "count"
    });

    expect(result?.triggerReason).toBe("count");
    expect(result?.pollutedText).toContain("怕被你决定");
  });
});
