import { describe, expect, it } from "vitest";
import { buildTaReplyPrompt } from "./prompts";

describe("buildTaReplyPrompt", () => {
  it("根据 TA 性别生成不同的 system 提示词版本", () => {
    const malePrompt = buildTaReplyPrompt({
      stage: "intro",
      taPronoun: "他",
      fearType: "害怕说真话",
      loadCount: 0,
      events: [],
      deletedDrafts: []
    });
    const femalePrompt = buildTaReplyPrompt({
      stage: "intro",
      taPronoun: "她",
      fearType: "害怕说真话",
      loadCount: 0,
      events: [],
      deletedDrafts: []
    });
    const neutralPrompt = buildTaReplyPrompt({
      stage: "intro",
      taPronoun: "TA",
      fearType: "害怕说真话",
      loadCount: 0,
      events: [],
      deletedDrafts: []
    });

    expect(malePrompt.system).toContain("男性暧昧对象");
    expect(femalePrompt.system).toContain("女性暧昧对象");
    expect(neutralPrompt.system).toContain("中性暧昧对象");
  });
});
