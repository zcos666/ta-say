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
});
