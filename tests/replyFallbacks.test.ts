import { describe, expect, it } from "vitest";
import { getFallbackReply } from "../src/features/reply/replyFallbacks";
import { draftCopy } from "../src/config/hardcodedCopy";
import { createEmptySession } from "../src/types/session";

describe("getFallbackReply", () => {
  it("命中具体关键词时返回对应的 fallback 回复", () => {
    const session = createEmptySession();
    session.stage = "first_pollution";

    const reply = getFallbackReply(session, 1, "没事", "keyword");

    expect(reply[0]).toBe("不爱了，你还发给我？");
  });

  it("没有具体关键词时退回通用关键词回复", () => {
    const session = createEmptySession();
    session.stage = "first_pollution";

    const reply = getFallbackReply(session, 2, undefined, "keyword");

    expect(reply).toEqual(["你不是这个意思。", "我知道。"]);
  });

  it("命中停顿事件时优先返回停顿相关回复", () => {
    const session = createEmptySession();
    session.stage = "normal_chat";

    const reply = getFallbackReply(session, 1, undefined, undefined, ["hesitation_noticed"]);

    expect(reply[0]).toContain("停");
  });

  it("第 5 轮后会切换到更变态的不讲理回复池", () => {
    const session = createEmptySession();
    session.stage = "normal_chat";
    session.sendCount = 5;

    const reply = getFallbackReply(session, 1);

    expect(reply[0]).not.toBe("你继续说。");
  });

  it("最终段会切换到非人类恐怖回复池", () => {
    const session = createEmptySession();
    session.stage = "meta_break";
    session.sendCount = 5;

    const reply = getFallbackReply(session, 1);

    expect(reply[0]).toContain("不是");
    expect(reply[0]).not.toBe("你继续说。");
  });
});

describe("draftCopy.buildImmediateReply", () => {
  it("删除告白类句子时优先使用对应追问", () => {
    const reply = draftCopy.buildImmediateReply("我喜欢你");

    expect(reply).toMatch(/喜欢我这件事|为什么不发|我喜欢你/);
  });
});
