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

function extractReplyJson(raw: string, desiredReplyLineCount: 1 | 2): string[] {
  const normalized = raw.trim();
  const jsonMatch = normalized.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("LLM reply did not include JSON.");
  }

  const parsed = JSON.parse(jsonMatch[0]) as { reply?: unknown };

  if (!Array.isArray(parsed.reply)) {
    throw new Error("LLM reply JSON is missing reply array.");
  }

  const reply = parsed.reply
    .map((line) => (typeof line === "string" ? line.trim() : ""))
    .filter(Boolean)
    .slice(0, desiredReplyLineCount);

  if (reply.length === 0) {
    throw new Error("LLM reply array is empty.");
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
    temperature: 0.65,
    max_tokens: 140,
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

async function requestChatCompletion(messages: Array<{ role: "system" | "user"; content: string }>) {
  try {
    return await requestChatCompletionOnce(messages, true);
  } catch (error) {
    const status = typeof (error as { status?: unknown })?.status === "number"
      ? ((error as { status: number }).status)
      : 0;
    const errorText = typeof (error as { errorText?: unknown })?.errorText === "string"
      ? ((error as { errorText: string }).errorText)
      : "";
    const forceJsonMode = Boolean((error as { forceJsonMode?: unknown })?.forceJsonMode);

    if (forceJsonMode && shouldRetryWithoutJsonMode(status, errorText)) {
      return requestChatCompletionOnce(messages, false);
    }

    throw error;
  }
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
  ]);

  return {
    reply: extractReplyJson(rawContent, request.desiredReplyLineCount),
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
  ]);

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
  ]);

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
