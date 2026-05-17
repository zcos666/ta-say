import { describe, expect, it } from "vitest";
import {
  buildHardcodedTranslationReport,
  findBestSubtextMapping,
  resolveHardcodedPollutionText
} from "./subtextMappings";

describe("subtextMappings", () => {
  it("会按最长子串命中映射", () => {
    const matched = findBestSubtextMapping("我先不打扰了，你忙吧");

    expect(matched?.matchedAlias).toBe("先不打扰了");
    expect(matched?.entry.sharpTranslation).toContain("等你说你不忙");
  });

  it("保留已设计好的旧反义污染文案", () => {
    const matched = findBestSubtextMapping("没事");

    expect(matched?.matchedAlias).toBe("没事");
    expect(resolveHardcodedPollutionText(matched!)).toBe("我不爱你了");
  });

  it("能生成硬编码翻译报告", () => {
    const matched = findBestSubtextMapping("我没生气");
    const report = buildHardcodedTranslationReport("我没生气", matched!, "TA");

    expect(report.possibleMeaning).toContain("其实已经生气了");
    expect(report.sharpTranslation).toContain("已经生气了");
    expect(report.betterExpression).toContain("比起说");
  });
});
