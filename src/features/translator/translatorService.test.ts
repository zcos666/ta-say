import { describe, expect, it } from "vitest";

import { translateLoveLanguage } from "./translatorService";

describe("translatorService", () => {
  it("命中硬编码映射时直接返回本地报告", async () => {
    const report = await translateLoveLanguage("你忙吧");

    expect(report.possibleMeaning).toContain("希望你放下手头的事");
    expect(report.sharpTranslation).toContain("等你说你不忙");
  });
});
