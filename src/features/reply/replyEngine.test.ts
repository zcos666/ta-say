import { beforeEach, describe, expect, it, vi } from "vitest";
import { createChatMessage, createEmptySession, type SessionState } from "../../types/session";

const generateTaReplyMock = vi.fn();
const streamTaReplyMock = vi.fn();

vi.mock("../../services/api/llmClient", () => ({
  generateTaReply: (...args: unknown[]) => generateTaReplyMock(...args),
  streamTaReply: (...args: unknown[]) => streamTaReplyMock(...args)
}));

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
  beforeEach(() => {
    generateTaReplyMock.mockReset();
    streamTaReplyMock.mockReset();
  });

  it("recentMessages 只保留真正对话，并优先保留用户原话", async () => {
    const session = createSession({
      chatHistory: [
        createChatMessage("ta", "前一句正常回复"),
        createChatMessage("system", "系统提示", { kind: "warning" }),
        createChatMessage("user", "我没事。", { kind: "polluted", originalText: "没事" }),
        createChatMessage("ta", "一张监控图", { kind: "monitor_image" }),
        createChatMessage("system", "TA 发来了一张定位图。", { kind: "location_notice" }),
        createChatMessage("ta", "你刚刚为什么停住了")
      ]
    });

    generateTaReplyMock.mockResolvedValueOnce({
      reply: ["我在看"],
      source: "llm"
    });

    await buildReply({
      session,
      originalInput: "没事",
      pollutedInput: "我没事，我只是怕你觉得我麻烦。",
      triggerReason: "keyword"
    });

    const request = generateTaReplyMock.mock.calls[0]?.[0] as {
      recentMessages?: Array<{ role: string; text: string }>;
    };

    expect(request.recentMessages).toEqual([
      { role: "ta", text: "前一句正常回复" },
      { role: "user", text: "没事" },
      { role: "ta", text: "你刚刚为什么停住了" }
    ]);
  });
});
