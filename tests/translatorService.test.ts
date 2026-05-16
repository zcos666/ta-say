import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const loveTranslateMock = vi.fn();
const shareLineMock = vi.fn();

vi.mock("../src/services/api/llmClient", () => ({
  llmClient: {
    isEnabled: () => true,
    loveTranslate: (...args: unknown[]) => loveTranslateMock(...args),
    shareLine: (...args: unknown[]) => shareLineMock(...args),
  },
}));

import { translateConversation } from "../src/features/translator/translatorService";

describe("translateConversation", () => {
  beforeEach(() => {
    loveTranslateMock.mockReset();
    shareLineMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("在大模型成功时优先使用大模型结果", async () => {
    loveTranslateMock.mockResolvedValueOnce({
      original: "没事，你忙吧。",
      possibleMeaning: "我其实很在意。",
      sharpTranslation: "我想被你认真安抚。",
      betterExpression: "我其实有点失落。",
      actionAdvice: "把需求说具体。",
    });
    shareLineMock.mockResolvedValueOnce({
      shareLine: "这次请别再让我猜你在想什么。",
    });

    const result = await translateConversation({
      chatText: "A: 你今天怎么这么晚回？\nB: 没事，你忙吧。",
      fearType: "害怕说真话",
      taPronoun: "TA",
      endingType: "梦醒翻译家",
      pollutionCount: 1,
      deletedDraftCount: 0,
      loadCount: 0,
      hardestSentence: "没事，你忙吧。",
      hasFinishedGame: true,
    });

    expect(result.usedFallback).toBe(false);
    expect(result.shareLineUsedFallback).toBe(false);
    expect(result.report.sharpTranslation).toBe("我想被你认真安抚。");
    expect(result.shareCardData.aiTranslation).toBe("我想被你认真安抚。");
    expect(result.shareCardData.shareLine).toBe("这次请别再让我猜你在想什么。");
    expect(loveTranslateMock).toHaveBeenCalledTimes(1);
    expect(shareLineMock).toHaveBeenCalledTimes(1);
  });

  it("在分享短句大模型失败时保留翻译结果并回退本地短句", async () => {
    loveTranslateMock.mockResolvedValueOnce({
      original: "没事，你忙吧。",
      possibleMeaning: "我其实很在意。",
      sharpTranslation: "我想被你认真安抚。",
      betterExpression: "我其实有点失落。",
      actionAdvice: "把需求说具体。",
    });
    shareLineMock.mockRejectedValueOnce(new Error("share offline"));

    const result = await translateConversation({
      chatText: "A: 你今天怎么这么晚回？\nB: 没事，你忙吧。",
      fearType: "害怕说真话",
      taPronoun: "TA",
      endingType: "草稿幽灵",
      pollutionCount: 1,
      deletedDraftCount: 0,
      loadCount: 0,
      hardestSentence: "没事，你忙吧。",
      hasFinishedGame: true,
    });

    expect(result.usedFallback).toBe(false);
    expect(result.shareLineUsedFallback).toBe(true);
    expect(result.report.sharpTranslation).toBe("我想被你认真安抚。");
    expect(result.shareCardData.shareLine).toBe("你删掉的话，比你发出去的更诚实。");
  });

  it("在大模型不可用时回退到本地翻译与分享短句", async () => {
    loveTranslateMock.mockRejectedValueOnce(new Error("offline"));
    shareLineMock.mockRejectedValueOnce(new Error("offline"));

    const result = await translateConversation({
      chatText: "A: 你今天怎么这么晚回？\nB: 没事，你忙吧。",
      fearType: "害怕说真话",
      taPronoun: "TA",
      endingType: "草稿幽灵",
      pollutionCount: 7,
      deletedDraftCount: 3,
      loadCount: 2,
      hardestSentence: "没事，你忙吧。",
      hasFinishedGame: true,
    });

    expect(result.usedFallback).toBe(true);
    expect(result.shareLineUsedFallback).toBe(true);
    expect(result.report.sharpTranslation).toContain("我不是没事");
    expect(result.shareCardData.shareLine).toBe("你删掉的话，比你发出去的更诚实。");
    expect(loveTranslateMock).toHaveBeenCalledTimes(1);
    expect(shareLineMock).toHaveBeenCalledTimes(1);
  });
});
