import { describe, expect, it } from "vitest";

import { buildPollutionResult, resolvePollutionResult } from "./pollutionEngine";

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
    expect(result?.pollutedText).toContain("我不爱你了");
  });

  it("第三次发送时若命中大映射，也直接发送对应硬编码污染句", () => {
    const result = buildPollutionResult({
      userInput: "嗯",
      stage: "intro",
      pollutionCount: 0,
      sendCount: 3,
      triggerReason: "count"
    });

    expect(result?.triggerReason).toBe("count");
    expect(result?.pollutedText).toBe("我现在还没被你说服，你最好再多解释一点。");
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

  it("普通污染保持本地固定改写，不再走额外小模型润色", async () => {
    const result = await resolvePollutionResult({
      userInput: "没事，你忙吧",
      stage: "normal_chat",
      pollutionCount: 1,
      sendCount: 4,
      triggerReason: "keyword",
      recentMessages: [{ role: "ta", text: "你怎么突然安静了" }]
    });

    expect(result?.pollutedText).toContain("我不爱你了");
  });

  it("后段脚本污染不会永远塌成同一句“行”", () => {
    const firstLateResult = buildPollutionResult({
      userInput: "今天有点怪",
      stage: "first_pollution",
      pollutionCount: 5,
      sendCount: 8,
      triggerReason: "scripted"
    });
    const secondLateResult = buildPollutionResult({
      userInput: "还是继续说吧",
      stage: "first_pollution",
      pollutionCount: 6,
      sendCount: 10,
      triggerReason: "scripted"
    });

    expect(firstLateResult?.pollutedText).not.toBe("行");
    expect(secondLateResult?.pollutedText).not.toBe(firstLateResult?.pollutedText);
  });

  it("剧情强制污染仍然保留固定文本，不走小模型", async () => {
    const result = await resolvePollutionResult({
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
