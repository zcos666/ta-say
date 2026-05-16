import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { streamTaReply } from "../src/services/api/llmClient";

function createSseResponse(chunks: string[]) {
  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      start(controller) {
        chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
        controller.close();
      }
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream"
      }
    }
  );
}

describe("streamTaReply", () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = import.meta.env.VITE_LLM_API_KEY;
  const originalBaseUrl = import.meta.env.VITE_LLM_BASE_URL;
  const originalModel = import.meta.env.VITE_LLM_MODEL;

  beforeEach(() => {
    import.meta.env.VITE_LLM_API_KEY = "test-key";
    import.meta.env.VITE_LLM_BASE_URL = "https://example.com/v1";
    import.meta.env.VITE_LLM_MODEL = "test-model";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    import.meta.env.VITE_LLM_API_KEY = originalApiKey;
    import.meta.env.VITE_LLM_BASE_URL = originalBaseUrl;
    import.meta.env.VITE_LLM_MODEL = originalModel;
    vi.restoreAllMocks();
  });

  it("按换行增量解析多句回复", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      createSseResponse([
        'data: {"choices":[{"delta":{"content":"第一句\\n第二"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"句\\n"}}]}\n\n',
        "data: [DONE]\n\n"
      ])
    );

    globalThis.fetch = fetchMock as typeof fetch;

    const streamedLines: string[] = [];
    const result = await streamTaReply(
      {
        stage: "normal_chat",
        events: [],
        loadCount: 0,
        sendCount: 1,
        pollutionCount: 0,
        deletedDrafts: [],
        desiredReplyLineCount: 2,
        taPronoun: "TA",
        metaMemory: [],
        recentMessages: []
      },
      (line) => streamedLines.push(line)
    );

    expect(streamedLines).toEqual(["第一句", "第二句"]);
    expect(result.reply).toEqual(["第一句", "第二句"]);
    expect(result.source).toBe("llm");
  });
});
