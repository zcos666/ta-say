import { describe, expect, it } from "vitest";
import { shareCardComposer } from "../src/features/share-card";
import type { SessionState } from "../src/types/session";

function createSession(overrides: Partial<SessionState> = {}): SessionState {
  return {
    fearType: "害怕说真话",
    taPronoun: "TA",
    stage: "share_ready",
    chatHistory: [],
    originalInputs: [],
    pollutedInputs: [],
    triggeredKeywords: [],
    deletedDrafts: [],
    metaMemory: [],
    pollutionCount: 2,
    deletedDraftCount: 1,
    loadCount: 0,
    sendCount: 0,
    spaceVisitCount: 0,
    exitClickCount: 0,
    activeTimedPollution: false,
    hasFinishedGame: true,
    endingType: null,
    hardestSentence: "没事，你忙吧。",
    ...overrides,
  };
}

describe("shareCardComposer", () => {
  it("优先使用已生成的分享卡缓存", () => {
    const data = shareCardComposer({
      session: createSession({
        shareCardData: {
          endingType: "草稿幽灵",
          hardestSentence: "“缓存句子”",
          shareLine: "缓存短句",
          fearType: "害怕被控制",
          pollutionCount: 9,
          deletedDraftCount: 4,
          loadCount: 2,
          aiTranslation: "缓存翻译",
        },
      }),
    });

    expect(data.title).toBe("《过拟合恋人》关系幻觉报告");
    expect(data.endingType).toBe("草稿幽灵");
    expect(data.shareLine).toBe("缓存短句");
    expect(data.metrics[0]?.value).toBe("× 9");
  });

  it("在没有缓存时根据会话统计推断结局", () => {
    const data = shareCardComposer({
      session: createSession({
        pollutionCount: 6,
        deletedDraftCount: 2,
        loadCount: 1,
      }),
    });

    expect(data.endingType).toBe("反话感染者");
    expect(data.shareLine).toContain("没事");
  });
});
