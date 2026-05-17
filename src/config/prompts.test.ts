import { describe, expect, it } from "vitest";
import { buildTaReplyPrompt } from "./prompts";

function createRequest(loadCount: number) {
  return {
    stage: "intro",
    taPronoun: "TA" as const,
    loadCount,
    sendCount: 1,
    pollutionCount: 0,
    events: [],
    deletedDrafts: [],
    desiredReplyLineCount: 1 as const
  };
}

describe("buildTaReplyPrompt", () => {
  it("根据 TA 性别生成不同的 system 提示词版本", () => {
    const malePrompt = buildTaReplyPrompt({
      ...createRequest(0),
      taPronoun: "他",
    });
    const femalePrompt = buildTaReplyPrompt({
      ...createRequest(0),
      taPronoun: "她",
    });
    const neutralPrompt = buildTaReplyPrompt(createRequest(0));

    expect(malePrompt.system).toContain("男性暧昧对象");
    expect(femalePrompt.system).toContain("女性暧昧对象");
    expect(neutralPrompt.system).toContain("中性暧昧对象");
  });

  it("第一次回退后会叠加第一次和第二次之间的提示词", () => {
    const prompt = buildTaReplyPrompt(createRequest(1));

    expect(prompt.system).toContain("轻微既视感");
    expect(prompt.user).toContain("时间错位");
  });

  it("第三次回退后会叠加无法再回退的提示词", () => {
    const prompt = buildTaReplyPrompt(createRequest(3));

    expect(prompt.system).toContain("接管了“回退”本身");
    expect(prompt.user).toContain("出口已被你接管");
  });

  it("会明确要求优先回应最后一句实际发出的文本", () => {
    const prompt = buildTaReplyPrompt(createRequest(0));

    expect(prompt.user).toContain("真正要回应的对象");
    expect(prompt.user).toContain("优先回答最后一句");
    expect(prompt.user).toContain("不要突然跳去聊别的机制");
  });

  it("第 5 轮后但未进入最终段时，仍保持失控恋人风格", () => {
    const prompt = buildTaReplyPrompt({
      ...createRequest(0),
      stage: "normal_chat",
      sendCount: 5,
    });

    expect(prompt.user).toContain("更变态、更不讲理、更贴脸");
    expect(prompt.user).toContain("像恋人失控的感觉");
  });

  it("最终段会切到非人类恐怖角色风格", () => {
    const prompt = buildTaReplyPrompt({
      ...createRequest(0),
      stage: "meta_break",
      sendCount: 5,
    });

    expect(prompt.user).toContain("非人类存在");
    expect(prompt.user).toContain("恐怖东西聊天");
  });
});
