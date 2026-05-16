import { afterEach, describe, expect, it, vi } from "vitest";
import { translateConversation } from "../src/features/translator/translatorService";

describe("translateConversation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("在接口成功时优先使用远端结果", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          original: "没事，你忙吧。",
          possibleMeaning: "我其实很在意。",
          sharpTranslation: "我想被你认真安抚。",
          betterExpression: "我其实有点失落。",
          actionAdvice: "把需求说具体。",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          shareLine: "这次请别再让我猜你在想什么。",
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

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
  });

  it("在分享短句接口失败时保留远端翻译并回退本地短句", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          original: "没事，你忙吧。",
          possibleMeaning: "我其实很在意。",
          sharpTranslation: "我想被你认真安抚。",
          betterExpression: "我其实有点失落。",
          actionAdvice: "把需求说具体。",
        }),
      })
      .mockRejectedValueOnce(new Error("share offline"));

    vi.stubGlobal("fetch", fetchMock);

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

  it("在接口不可用时回退到本地翻译与分享短句", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);

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
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
