import type { ConversationMessage, ConversationSpeaker } from "../../types/distillation";

const SELF_SPEAKER_LABELS = ["self", "me", "我", "自己", "本人", "用户", "我方"];
const OTHER_SPEAKER_LABELS = ["other", "ta", "对方", "他", "她", "对面", "另一方"];

function normalizeContent(content: string) {
  return content.replace(/\s+/g, " ").trim();
}

function resolveSpeaker(label: string): ConversationSpeaker | null {
  const normalized = label.trim().toLowerCase();

  if (SELF_SPEAKER_LABELS.includes(normalized)) {
    return "self";
  }

  if (OTHER_SPEAKER_LABELS.includes(normalized)) {
    return "other";
  }

  return null;
}

function parseRawConversation(rawConversation: string): ConversationMessage[] {
  const lines = rawConversation
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const messages: ConversationMessage[] = [];

  for (const line of lines) {
    const match = line.match(/^([^:：]{1,12})[:：]\s*(.+)$/);

    if (!match) {
      if (messages.length === 0) {
        throw new Error("聊天记录需要按“我：...”或“TA：...”的格式输入。");
      }

      messages[messages.length - 1] = {
        ...messages[messages.length - 1],
        content: normalizeContent(`${messages[messages.length - 1].content}\n${line}`),
      };
      continue;
    }

    const speakerLabel = match[1];
    const content = normalizeContent(match[2]);
    const speaker = resolveSpeaker(speakerLabel);

    if (!speaker || !content) {
      throw new Error(`无法识别说话人标记：${speakerLabel}`);
    }

    messages.push({
      speaker,
      content,
      metadata: {
        rawSpeakerLabel: speakerLabel,
      },
    });
  }

  return messages;
}

function sanitizeMessage(message: ConversationMessage, index: number): ConversationMessage {
  const content = normalizeContent(message.content);

  if (!content) {
    throw new Error(`第 ${index + 1} 条聊天内容为空。`);
  }

  return {
    speaker: message.speaker,
    content,
    timestamp: message.timestamp?.trim() || undefined,
    metadata: message.metadata,
  };
}

export function normalizeConversationInput(conversation: string | ConversationMessage[]) {
  const normalizedMessages = typeof conversation === "string"
    ? parseRawConversation(conversation)
    : conversation.map((message, index) => sanitizeMessage(message, index));

  if (normalizedMessages.length < 2) {
    throw new Error("聊天记录至少需要两条消息。");
  }

  const speakers = new Set(normalizedMessages.map((message) => message.speaker));
  if (!speakers.has("self") || !speakers.has("other")) {
    throw new Error("聊天记录必须同时包含 self 和 other 两个说话人。");
  }

  return normalizedMessages;
}
