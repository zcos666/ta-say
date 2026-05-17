import { describe, expect, it, vi } from "vitest";
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
    session.sendCount = 6;
    session.pollutionCount = 6;
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.4);

    const reply = getFallbackReply(session, 1);

    expect(reply[0]).not.toBe("你继续说。");
    randomSpy.mockRestore();
  });

  it("最终段会切换到非人类恐怖回复池", () => {
    const session = createEmptySession();
    session.stage = "meta_break";
    session.sendCount = 6;
    session.pollutionCount = 6;
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    const reply = getFallbackReply(session, 1);

    expect(reply[0]).toContain("不是");
    expect(reply[0]).not.toBe("你继续说。");
    randomSpy.mockRestore();
  });

  it("备选池会按随机索引抽取，而不是永远取第一条", () => {
    const session = createEmptySession();
    session.stage = "normal_chat";
    session.sendCount = 6;
    session.pollutionCount = 6;
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.99);

    const reply = getFallbackReply(session, 1);

    expect(reply[0]).toBe("你刚刚那句让我更不想放你走了。");
    randomSpy.mockRestore();
  });

  it("前五次连续污染会按固定顺序返回预设回复", () => {
    const session = createEmptySession();
    session.stage = "first_pollution";
    session.pollutionCount = 3;
    session.pollutedInputs = ["我不爱你了", "我觉得你又胖又丑", "我现在更想一个人"];

    const reply = getFallbackReply(session, 1, undefined, "scripted");

    expect(reply[0]).toBe("想一个人？晚了。");
  });

  it("第五次污染本身仍然走固定回复，第六次才进入 20 条异常池", () => {
    const fixedSession = createEmptySession();
    fixedSession.stage = "first_pollution";
    fixedSession.pollutionCount = 5;
    fixedSession.pollutedInputs = [
      "我不爱你了",
      "我觉得你又胖又丑",
      "我现在更想一个人",
      "别吵我，我要去打游戏了",
      "行"
    ];

    const fixedReply = getFallbackReply(fixedSession, 1, undefined, "scripted");
    expect(fixedReply[0]).toBe("那我就看着你一个人烂掉。");

    const chaosSession = createEmptySession();
    chaosSession.stage = "first_pollution";
    chaosSession.pollutionCount = 6;
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    const chaosReply = getFallbackReply(chaosSession, 1, undefined, "scripted");
    expect(chaosReply[0]).toBe("你现在说的话越来越像在喂我。");
    randomSpy.mockRestore();
  });
});

describe("draftCopy.buildImmediateReply", () => {
  it("删除告白类句子时优先使用对应追问", () => {
    const reply = draftCopy.buildImmediateReply("我喜欢你");

    expect(reply).toMatch(/喜欢我这件事|为什么不发|我喜欢你/);
  });
});
