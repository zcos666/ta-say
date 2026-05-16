import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { llmClient, streamTaReply } from "../src/services/api/llmClient";

function createSseResponse(chunks: string[]) {
  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      start(controller) {
        chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
        controller.close();
      },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
      },
    },
  );
}

function createJsonResponse(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(payload),
    text: vi.fn(),
  } as unknown as Response;
}

function createErrorResponse(status: number, errorText: string): Response {
  return {
    ok: false,
    status,
    json: vi.fn(),
    text: vi.fn().mockResolvedValue(errorText),
  } as unknown as Response;
}

describe("llmClient", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_LLM_API_KEY", "test-key");
    vi.stubEnv("VITE_LLM_BASE_URL", "https://api.example.com/v1");
    vi.stubEnv("VITE_LLM_MODEL", "test-model");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("按换行增量解析多句回复", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      createSseResponse([
        'data: {"choices":[{"delta":{"content":"第一句\\n第二"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"句\\n"}}]}\n\n',
        "data: [DONE]\n\n",
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);

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
        recentMessages: [],
      },
      (line) => streamedLines.push(line),
    );

    expect(streamedLines).toEqual(["第一句", "第二句"]);
    expect(result.reply).toEqual(["第一句", "第二句"]);
    expect(result.source).toBe("llm");
  });

  it("loveTranslate 默认请求 JSON 输出模式", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse({
        choices: [
          {
            message: {
              content:
                '{"original":"没事，你忙吧。","possibleMeaning":"我其实在意。","sharpTranslation":"我希望你在意我的失落。","betterExpression":"我其实有点失落。","actionAdvice":"把感受说具体。"}',
            },
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await llmClient.loveTranslate("A: 你今天怎么这么晚回？\nB: 没事，你忙吧。", {
      fearType: "害怕说真话",
      taPronoun: "TA",
    });

    expect(result?.sharpTranslation).toBe("我希望你在意我的失落。");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const requestBody = JSON.parse(String(requestInit.body)) as Record<string, unknown>;
    expect(requestBody.response_format).toEqual({ type: "json_object" });
  });

  it("shareLine 在服务端不支持 JSON 模式时自动回退普通请求", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createErrorResponse(400, "response_format json_object unsupported"))
      .mockResolvedValueOnce(
        createJsonResponse({
          choices: [
            {
              message: {
                content: '{"shareLine":"真的想说的话，总会从嘴硬里漏出来。"}',
              },
            },
          ],
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await llmClient.shareLine({
      endingType: "梦醒翻译家",
      hardestSentence: "没事，你忙吧。",
      pollutionCount: 1,
      deletedCount: 0,
      loadCount: 0,
    });

    expect(result?.shareLine).toBe("真的想说的话，总会从嘴硬里漏出来。");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const firstRequestBody = JSON.parse(String((fetchMock.mock.calls[0]?.[1] as RequestInit).body)) as Record<
      string,
      unknown
    >;
    const secondRequestBody = JSON.parse(String((fetchMock.mock.calls[1]?.[1] as RequestInit).body)) as Record<
      string,
      unknown
    >;

    expect(firstRequestBody.response_format).toEqual({ type: "json_object" });
    expect(secondRequestBody.response_format).toBeUndefined();
  });
});
