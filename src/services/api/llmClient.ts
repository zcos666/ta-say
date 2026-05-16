import { buildTaReplyPrompt } from "../../config/prompts";
import type { LoveTranslationReport, TaReplyRequest, TaReplyResponse } from "../../types/api";

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

function extractReplyJson(raw: string): string[] {
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
    .slice(0, 2);

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

function buildLoveTranslateMessages(chatText: string): { system: string; user: string } {
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
      `聊天内容：\n${chatText}`
    ].join("\n")
  };
}

async function requestChatCompletion(messages: Array<{ role: "system" | "user"; content: string }>) {
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
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.95,
      max_tokens: 240,
      messages
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM request failed: ${response.status} ${errorText}`);
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
    reply: extractReplyJson(rawContent),
    source: "llm"
  };
}

async function loveTranslate(chatText: string): Promise<LoveTranslationReport | null> {
  if (!isEnabled()) {
    return null;
  }

  const prompt = buildLoveTranslateMessages(chatText);
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

export const llmClient = {
  isEnabled,
  taReply: generateTaReply,
  loveTranslate
};
