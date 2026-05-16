import { buildTaReplyPrompt } from "../../config/prompts";
import type {
  LoveTranslateRequest,
  LoveTranslationReport,
  ShareLineRequest,
  ShareLineResponse,
  TaReplyRequest,
  TaReplyResponse,
} from "../../types/api";

type ChatMessageContent = string | Array<{ type?: string; text?: string }> | undefined;

interface ChatCompletionChoice {
  message?: {
    content?: ChatMessageContent;
  };
}

interface ChatCompletionResponse {
  choices?: ChatCompletionChoice[];
  error?: {
    message?: string;
  };
}

interface ChatCompletionStreamChoice {
  delta?: {
    content?: string | Array<{ type?: string; text?: string }>;
  };
}

interface ChatCompletionStreamResponse {
  choices?: ChatCompletionStreamChoice[];
  error?: {
    message?: string;
  };
}

interface ChatCompletionOptions {
  temperature: number;
  maxTokens: number;
  preferJsonMode?: boolean;
}

interface ChatCompletionStreamOptions extends ChatCompletionOptions {
  onChunk: (chunk: string) => void;
}

function getEnvValue(key: "VITE_LLM_API_KEY" | "VITE_LLM_BASE_URL" | "VITE_LLM_MODEL"): string {
  return (import.meta.env[key] as string | undefined)?.trim() ?? "";
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function isEnabled(): boolean {
  return Boolean(getEnvValue("VITE_LLM_API_KEY"));
}

function extractMessageContent(content: ChatMessageContent): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => part.text?.trim() ?? "")
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function sanitizeReplyLine(line: string): string {
  return line
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/^[\-\*\u2022]+\s*/, "")
    .replace(/^第?\s*\d+\s*[句\.、:：-]\s*/, "")
    .trim();
}

function extractReplyLines(raw: string, desiredReplyLineCount: 1 | 2): string[] {
  const reply = raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map(sanitizeReplyLine)
    .filter(Boolean)
    .slice(0, desiredReplyLineCount);

  if (reply.length === 0) {
    throw new Error("LLM reply lines are empty.");
  }

  return reply;
}

function extractJson<T>(raw: string): T {
  const normalized = raw.trim();
  const jsonMatch = normalized.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("LLM response did not include JSON.");
  }

  return JSON.parse(jsonMatch[0]) as T;
}

function shouldRetryWithoutJsonMode(status: number, errorText: string): boolean {
  if (![400, 404, 415, 422].includes(status)) {
    return false;
  }

  const normalized = errorText.toLowerCase();
  const indicators = [
    "response_format",
    "json_object",
    "json schema",
    "json mode",
    "unsupported",
    "not support",
    "invalid parameter",
  ];

  return indicators.some((indicator) => normalized.includes(indicator));
}

function buildLoveTranslateMessages(
  chatText: string,
  context?: LoveTranslateRequest["context"],
): { system: string; user: string } {
  return {
    system: [
      "你是一个恋爱语言翻译官。",
      "你的任务是把聊天里的反话、回避和嘴硬表达翻译成更清楚的话。",
      "输出必须是 JSON，不要代码块，不要额外说明。",
      'JSON 格式固定为 {"original":"","possibleMeaning":"","sharpTranslation":"","betterExpression":"","actionAdvice":""}。'
    ].join("\n"),
    user: [
      "请分析下面这段聊天内容。",
      "要求：",
      "1. 语气可以犀利，但不能羞辱、攻击或贬低用户。",
      "2. 不要做心理诊断。",
      "3. 不要断言对方一定怎么想，只能说可能。",
      "4. 给出更好的表达方式和一条具体建议。",
      `用户关系恐惧类型：${context?.fearType ?? "未知"}`,
      `对方代称：${context?.taPronoun ?? "TA"}`,
      `聊天内容：\n${chatText}`
    ].join("\n")
  };
}

function buildShareLineMessages(payload: ShareLineRequest): { system: string; user: string } {
  return {
    system: [
      "你是《过拟合恋人》里的结局文案系统。",
      "你的任务是根据用户本轮互动数据，生成一句适合放在分享卡上的短句。",
      "输出必须是 JSON，不要代码块，不要额外说明。",
      'JSON 格式固定为 {"shareLine":""}。',
    ].join("\n"),
    user: [
      "请生成一句分享卡短句。",
      "要求：",
      "1. 有传播感。",
      "2. 有一点扎心。",
      "3. 不要羞辱用户。",
      "4. 不超过 25 个字。",
      "5. 风格像恋爱 Meta 恐怖游戏的结尾。",
      `结局类型：${payload.endingType}`,
      `最大嘴硬句：${payload.hardestSentence}`,
      `反义污染次数：${payload.pollutionCount}`,
      `删除草稿次数：${payload.deletedCount}`,
      `读档次数：${payload.loadCount}`,
    ].join("\n"),
  };
}

function extractShareLineJson(raw: string): string {
  const parsed = extractJson<{ shareLine?: unknown }>(raw);
  const shareLine = typeof parsed.shareLine === "string" ? parsed.shareLine.trim() : "";

  if (!shareLine) {
    throw new Error("LLM share line JSON is missing shareLine.");
  }

  return shareLine;
}

async function requestChatCompletionOnce(
  messages: Array<{ role: "system" | "user"; content: string }>,
  options: ChatCompletionOptions,
  forceJsonMode: boolean,
) {
  const apiKey = getEnvValue("VITE_LLM_API_KEY");

  if (!apiKey) {
    throw new Error("Missing VITE_LLM_API_KEY.");
  }

  const baseUrl = normalizeBaseUrl(getEnvValue("VITE_LLM_BASE_URL") || "https://api.openai.com/v1");
  const model = getEnvValue("VITE_LLM_MODEL") || "gpt-4o-mini";
  const requestBody: Record<string, unknown> = {
    model,
    temperature: options.temperature,
    max_tokens: options.maxTokens,
    messages,
  };

  if (forceJsonMode) {
    requestBody.response_format = { type: "json_object" };
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`LLM request failed: ${response.status} ${errorText}`);
    Object.assign(error, {
      status: response.status,
      errorText,
      forceJsonMode,
    });
    throw error;
  }

  const data = (await response.json()) as ChatCompletionResponse;

  if (data.error?.message) {
    throw new Error(data.error.message);
  }

  const rawContent = extractMessageContent(data.choices?.[0]?.message?.content);

  if (!rawContent) {
    throw new Error("LLM returned empty content.");
  }

  return rawContent;
}

async function requestChatCompletion(
  messages: Array<{ role: "system" | "user"; content: string }>,
  options: ChatCompletionOptions,
) {
  if (!options.preferJsonMode) {
    return requestChatCompletionOnce(messages, options, false);
  }

  try {
    return await requestChatCompletionOnce(messages, options, true);
  } catch (error) {
    const status = typeof (error as { status?: unknown })?.status === "number"
      ? (error as { status: number }).status
      : 0;
    const errorText = typeof (error as { errorText?: unknown })?.errorText === "string"
      ? (error as { errorText: string }).errorText
      : "";
    const forceJsonMode = Boolean((error as { forceJsonMode?: unknown })?.forceJsonMode);

    if (forceJsonMode && shouldRetryWithoutJsonMode(status, errorText)) {
      return requestChatCompletionOnce(messages, options, false);
    }

    throw error;
  }
}

function extractStreamDeltaContent(content: ChatCompletionStreamChoice["delta"] extends { content?: infer T } ? T : never) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => part.text?.trim() ?? "")
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

async function requestChatCompletionStream(
  messages: Array<{ role: "system" | "user"; content: string }>,
  options: ChatCompletionStreamOptions,
) {
  const apiKey = getEnvValue("VITE_LLM_API_KEY");

  if (!apiKey) {
    throw new Error("Missing VITE_LLM_API_KEY.");
  }

  const baseUrl = normalizeBaseUrl(getEnvValue("VITE_LLM_BASE_URL") || "https://api.openai.com/v1");
  const model = getEnvValue("VITE_LLM_MODEL") || "gpt-4o-mini";
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      stream: true,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM stream request failed: ${response.status} ${errorText}`);
  }

  if (!response.body) {
    throw new Error("LLM stream response body is empty.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let rawContent = "";
  let buffer = "";

  const processLine = (line: string) => {
    const trimmed = line.trim();

    if (!trimmed || !trimmed.startsWith("data:")) {
      return false;
    }

    const data = trimmed.slice(5).trim();

    if (data === "[DONE]") {
      return true;
    }

    const parsed = JSON.parse(data) as ChatCompletionStreamResponse;

    if (parsed.error?.message) {
      throw new Error(parsed.error.message);
    }

    const chunk = extractStreamDeltaContent(parsed.choices?.[0]?.delta?.content);

    if (!chunk) {
      return false;
    }

    rawContent += chunk;
    options.onChunk(chunk);
    return false;
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });

    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (processLine(line)) {
        return rawContent;
      }
    }

    if (done) {
      break;
    }
  }

  if (buffer.trim()) {
    processLine(buffer);
  }

  if (!rawContent) {
    throw new Error("LLM stream returned empty content.");
  }

  return rawContent;
}

export async function generateTaReply(request: TaReplyRequest): Promise<TaReplyResponse> {
  const prompt = buildTaReplyPrompt(request);
  const rawContent = await requestChatCompletion([
    {
      role: "system",
      content: prompt.system
    },
    {
      role: "user",
      content: prompt.user
    }
  ], {
    temperature: 0.6,
    maxTokens: 90,
  });

  return {
    reply: extractReplyLines(rawContent, request.desiredReplyLineCount),
    source: "llm"
  };
}

export async function streamTaReply(
  request: TaReplyRequest,
  onLine: (line: string) => void,
): Promise<TaReplyResponse> {
  const prompt = buildTaReplyPrompt(request);
  const emittedLines: string[] = [];
  let lineBuffer = "";

  const rawContent = await requestChatCompletionStream([
    {
      role: "system",
      content: prompt.system
    },
    {
      role: "user",
      content: prompt.user
    }
  ], {
    temperature: 0.6,
    maxTokens: 90,
    onChunk: (chunk) => {
      lineBuffer += chunk;
      const segments = lineBuffer.replace(/\r\n/g, "\n").split("\n");
      lineBuffer = segments.pop() ?? "";

      for (const segment of segments) {
        const line = sanitizeReplyLine(segment);

        if (!line || emittedLines.length >= request.desiredReplyLineCount) {
          continue;
        }

        emittedLines.push(line);
        onLine(line);
      }
    }
  });

  const fallbackLines = extractReplyLines(rawContent, request.desiredReplyLineCount);

  if (emittedLines.length === 0) {
    fallbackLines.forEach((line) => onLine(line));
    return {
      reply: fallbackLines,
      source: "llm"
    };
  }

  if (emittedLines.length < fallbackLines.length) {
    fallbackLines.slice(emittedLines.length).forEach((line) => onLine(line));
  }

  return {
    reply: fallbackLines,
    source: "llm"
  };
}

async function loveTranslate(
  chatText: string,
  context?: LoveTranslateRequest["context"],
): Promise<LoveTranslationReport | null> {
  if (!isEnabled()) {
    return null;
  }

  const prompt = buildLoveTranslateMessages(chatText, context);
  const rawContent = await requestChatCompletion([
    {
      role: "system",
      content: prompt.system
    },
    {
      role: "user",
      content: prompt.user
    }
  ], {
    temperature: 0.55,
    maxTokens: 180,
    preferJsonMode: true,
  });

  return extractJson<LoveTranslationReport>(rawContent);
}

async function shareLine(payload: ShareLineRequest): Promise<ShareLineResponse | null> {
  if (!isEnabled()) {
    return null;
  }

  const prompt = buildShareLineMessages(payload);
  const rawContent = await requestChatCompletion([
    {
      role: "system",
      content: prompt.system,
    },
    {
      role: "user",
      content: prompt.user,
    },
  ], {
    temperature: 0.7,
    maxTokens: 48,
    preferJsonMode: true,
  });

  return {
    shareLine: extractShareLineJson(rawContent),
  };
}

export const llmClient = {
  isEnabled,
  taReply: generateTaReply,
  loveTranslate,
  shareLine,
};
