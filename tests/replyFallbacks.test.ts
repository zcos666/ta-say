import { describe, expect, it } from "vitest";
import { getFallbackReply } from "../src/features/reply/replyFallbacks";
import { draftCopy } from "../src/config/hardcodedCopy";
import { createEmptySession } from "../src/types/session";

describe("getFallbackReply", () => {
  it("命中具体关键词时返回对应的 fallback 回复", () => {
    const session = createEmptySession();
    session.stage = "first_pollution";

    const reply = getFallbackReply(session, 1, "没事", "keyword");

    expect(reply[0]).toContain("没事");
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
});

describe("draftCopy.buildImmediateReply", () => {
  it("删除告白类句子时优先使用对应追问", () => {
    const reply = draftCopy.buildImmediateReply("我喜欢你");

    expect(reply).toMatch(/喜欢我这件事|为什么不发|我喜欢你/);
  });
});
