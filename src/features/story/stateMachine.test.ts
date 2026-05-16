import { describe, expect, it } from "vitest";
import { deriveNextStage } from "./stateMachine";
import { createEmptySession } from "../../types/session";

describe("deriveNextStage", () => {
  it("intro 阶段第二次发送后进入 normal_chat", () => {
    const session = createEmptySession();
    session.stage = "intro";

    expect(
      deriveNextStage({
        session,
        nextSendCount: 2
      })
    ).toBe("normal_chat");
  });

  it("仅在前期阶段把触发污染推进到 first_pollution", () => {
    const session = createEmptySession();
    session.stage = "normal_chat";

    expect(
      deriveNextStage({
        session,
        nextSendCount: 3,
        triggerReason: "count"
      })
    ).toBe("first_pollution");
  });

  it("后期阶段收到普通触发时不回退到 first_pollution", () => {
    const session = createEmptySession();
    session.stage = "save_loaded_twice";

    expect(
      deriveNextStage({
        session,
        nextSendCount: 5,
        triggerReason: "keyword"
      })
    ).toBe("save_loaded_twice");
  });
});
