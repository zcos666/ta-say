import { describe, expect, it, vi } from "vitest";
import { createEmptySession, type SessionState } from "../../types/session";

import { buildReply } from "./replyEngine";

function createSession(overrides: Partial<SessionState> = {}): SessionState {
  return {
    ...createEmptySession(),
    taPronoun: "TA",
    stage: "normal_chat",
    ...overrides
  };
}

describe("replyEngine", () => {
  it("始终返回本地硬编码回复", async () => {
    const session = createSession({
      sendCount: 5,
      stage: "normal_chat",
    });

    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    const reply = await buildReply({
      session,
      originalInput: "没事",
      pollutedInput: "没事",
    });

    expect(reply.length).toBeGreaterThan(0);
    expect(reply[0]).toBe("你现在说的话越来越像在喂我。");
    randomSpy.mockRestore();
  });
});
