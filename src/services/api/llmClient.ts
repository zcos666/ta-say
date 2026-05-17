import { buildTaReplyPrompt } from "../../config/prompts";
import type {
  LoveTranslateRequest,
  LoveTranslationReport,
  PollutionRewriteRequest,
  PollutionRewriteResponse,
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
  signal?: AbortSignal;
}

interface ChatCompletionStreamOptions extends ChatCompletionOptions {
  onChunk: (chunk: string) => void;
}

interface ModelConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

type ModelTarget = "default" | "fast";

function getEnvValue(
  key:
    | "VITE_LLM_API_KEY"
    | "VITE_LLM_BASE_URL"
    | "VITE_LLM_MODEL"
    | "VITE_FAST_LLM_API_KEY"
    | "VITE_FAST_LLM_BASE_URL"
    | "VITE_FAST_LLM_MODEL"
): string {
  return (import.meta.env[key] as string | undefined)?.trim() ?? "";
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function resolveModelConfig(target: ModelTarget): ModelConfig {
  if (target === "fast") {
    const fastApiKey = getEnvValue("VITE_FAST_LLM_API_KEY");
    const fastBaseUrl = getEnvValue("VITE_FAST_LLM_BASE_URL");
    const fastModel = getEnvValue("VITE_FAST_LLM_MODEL");

    if (fastApiKey) {
      return {
        apiKey: fastApiKey,
        baseUrl: normalizeBaseUrl(fastBaseUrl || getEnvValue("VITE_LLM_BASE_URL") || "https://api.openai.com/v1"),
        model: fastModel || getEnvValue("VITE_LLM_MODEL") || "gpt-4o-mini"
      };
    }
  }

  return {
    apiKey: getEnvValue("VITE_LLM_API_KEY"),
    baseUrl: normalizeBaseUrl(getEnvValue("VITE_LLM_BASE_URL") || "https://api.openai.com/v1"),
    model: getEnvValue("VITE_LLM_MODEL") || "gpt-4o-mini"
  };
}

function isEnabled(): boolean {
  return Boolean(getEnvValue("VITE_LLM_API_KEY"));
}

function isFastEnabled(): boolean {
  const fastConfig = resolveModelConfig("fast");
  return Boolean(fastConfig.apiKey);
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

function buildPollutionRewriteMessages(payload: PollutionRewriteRequest): { system: string; user: string } {
  const recentMessages = (payload.recentMessages ?? [])
    .slice(-4)
    .map((message) => `${message.role}: ${message.text}`)
    .join("\n");

  return {
    system: [
      "你是一个极快的恋爱聊天反向翻译器。",
      "你的唯一任务，是把用户这句嘴硬、回避、反话或缩回去的话，改写成一句'被系统反译过的原句'。",
      "改写时要保留原句表层语义、措辞回声或句式骨架，再把隐藏的真实意思混进去。",
      "不要把结果写成纯心理分析或纯潜台词解释，它必须仍然像用户刚刚发出去的一句话，只是被反向翻译了。",
      "只做反向翻译，不补剧情，不扩写背景，不分析，不安慰，不解释。",
      "输出必须只有最终改写后的那一句话，不要 JSON，不要代码块，不要引号，不要多句。"
    ].join("\n"),
    user: [
      `当前阶段：${payload.stage}`,
      `触发原因：${payload.triggerReason ?? "无"}`,
      `命中关键词：${payload.triggerKeyword ?? "无"}`,
      `TA 称呼：${payload.taPronoun ?? "TA"}`,
      `累计污染次数：${payload.pollutionCount}`,
      `用户发送次数：${payload.sendCount}`,
      `最近聊天（仅供语气参考）：\n${recentMessages || "无"}`,
      `用户原句：${payload.userInput}`,
      "要求：",
      "1. 只输出一句中文。",
      "2. 保留原句核心语义，并尽量保留几个原句里的词、语气或句式，让人一眼看出它是原句被改写了。",
      "3. 在原句反译的基础上，融合一点真实潜台词，但潜台词不能喧宾夺主。",
      "4. 语气可以更直接，但不能突然像旁白、说明书或心理报告。",
      "5. 不要发明新事实，不要提系统设定，不要超出这句话本身能推出的意思。 "
    ].join("\n")
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
  target: ModelTarget = "default",
) {
  const modelConfig = resolveModelConfig(target);

  if (!modelConfig.apiKey) {
    throw new Error(target === "fast" ? "Missing fast LLM API key." : "Missing VITE_LLM_API_KEY.");
  }

  const requestBody: Record<string, unknown> = {
    model: modelConfig.model,
    temperature: options.temperature,
    max_tokens: options.maxTokens,
    messages,
  };

  if (forceJsonMode) {
    requestBody.response_format = { type: "json_object" };
  }

  const response = await fetch(`${modelConfig.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${modelConfig.apiKey}`,
    },
    body: JSON.stringify(requestBody),
    signal: options.signal
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
  target: ModelTarget = "default",
) {
  if (!options.preferJsonMode) {
    return requestChatCompletionOnce(messages, options, false, target);
  }

  try {
    return await requestChatCompletionOnce(messages, options, true, target);
  } catch (error) {
    const status = typeof (error as { status?: unknown })?.status === "number"
      ? (error as { status: number }).status
      : 0;
    const errorText = typeof (error as { errorText?: unknown })?.errorText === "string"
      ? (error as { errorText: string }).errorText
      : "";
    const forceJsonMode = Boolean((error as { forceJsonMode?: unknown })?.forceJsonMode);

    if (forceJsonMode && shouldRetryWithoutJsonMode(status, errorText)) {
      return requestChatCompletionOnce(messages, options, false, target);
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
  target: ModelTarget = "default",
) {
  const modelConfig = resolveModelConfig(target);

  if (!modelConfig.apiKey) {
    throw new Error(target === "fast" ? "Missing fast LLM API key." : "Missing VITE_LLM_API_KEY.");
  }

  const response = await fetch(`${modelConfig.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${modelConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: modelConfig.model,
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
  }, "fast");

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
  }, "fast");
  const replyLines = extractReplyLines(rawContent, request.desiredReplyLineCount);

  if (emittedLines.length === 0) {
    replyLines.forEach((line) => onLine(line));
  } else if (emittedLines.length < replyLines.length) {
    replyLines.slice(emittedLines.length).forEach((line) => onLine(line));
  }

  return {
    reply: replyLines,
    source: "llm"
  };
}

async function rewritePollution(payload: PollutionRewriteRequest): Promise<PollutionRewriteResponse | null> {
  if (!isFastEnabled()) {
    return null;
  }

  const prompt = buildPollutionRewriteMessages(payload);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 160);

  try {
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
    temperature: 0.35,
    maxTokens: 24,
    signal: controller.signal
  }, "fast");

  const pollutedText = sanitizeReplyLine(rawContent.split(/\r?\n/).find((line) => line.trim()) ?? rawContent);

  if (!pollutedText) {
    throw new Error("Fast pollution rewrite returned empty content.");
  }

  return { pollutedText };
  } finally {
    clearTimeout(timeout);
  }
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
  isFastEnabled,
  taReply: generateTaReply,
  rewritePollution,
  loveTranslate,
  shareLine,
};
