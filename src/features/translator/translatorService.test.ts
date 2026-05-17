import { beforeEach, describe, expect, it, vi } from "vitest";

const loveTranslateMock = vi.fn();
const shareLineMock = vi.fn();

vi.mock("../../services/api/llmClient", () => ({
  llmClient: {
    loveTranslate: (...args: unknown[]) => loveTranslateMock(...args),
    shareLine: (...args: unknown[]) => shareLineMock(...args)
  }
}));

import { translateLoveLanguage } from "./translatorService";

describe("translatorService", () => {
  beforeEach(() => {
    loveTranslateMock.mockReset();
    shareLineMock.mockReset();
  });

  it("命中硬编码映射时直接返回本地报告，不调用翻译大模型", async () => {
    const report = await translateLoveLanguage("你忙吧");

    expect(report.possibleMeaning).toContain("希望你放下手头的事");
    expect(report.sharpTranslation).toContain("等你说你不忙");
    expect(loveTranslateMock).not.toHaveBeenCalled();
  });
});
