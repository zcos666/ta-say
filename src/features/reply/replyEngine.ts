import { isLlmContextMessage, type SessionState } from "../../types/session";
import type { TaReplyRequest, TaReplyResponse } from "../../types/api";
import type { StoryEvent, TriggerReason } from "../../types/story";
import { generateTaReply, streamTaReply } from "../../services/api/llmClient";
import { getFallbackReply } from "./replyFallbacks";

interface ReplyContext {
  session: SessionState;
  originalInput?: string;
  pollutedInput?: string;
  triggerKeyword?: string;
  triggerReason?: TriggerReason;
  events?: StoryEvent[];
}

function pickReplyLineCount(): 1 | 2 {
  return Math.random() < 0.5 ? 1 : 2;
}

function buildRecentMessages(
  session: SessionState,
  originalInput?: string,
  pollutedInput?: string,
) {
  const recentMessages = session.chatHistory
    .filter(isLlmContextMessage)
    .slice(-8)
    .map((message) => ({
      role: message.role,
      text: message.role === "user" ? message.originalText?.trim() || message.displayedText : message.displayedText
    }));

  const lastMessage = recentMessages[recentMessages.length - 1];
  const shouldDropDuplicatedLatestUserMessage =
    lastMessage?.role === "user" &&
    [pollutedInput?.trim(), originalInput?.trim()].filter(Boolean).includes(lastMessage.text.trim());

  if (shouldDropDuplicatedLatestUserMessage) {
    recentMessages.pop();
  }

  return recentMessages.slice(-6);
}

function createReplyRequest({
  session,
  originalInput,
  pollutedInput,
  triggerKeyword,
  triggerReason,
  events = []
}: ReplyContext, desiredReplyLineCount: 1 | 2): TaReplyRequest {
  return {
    stage: session.stage,
    originalInput,
    pollutedInput,
    triggerKeyword,
    events,
    loadCount: session.loadCount,
    sendCount: session.sendCount,
    pollutionCount: session.pollutionCount,
    deletedDrafts: session.deletedDrafts,
    triggerReason,
    taPronoun: session.taPronoun,
    metaMemory: session.metaMemory,
    desiredReplyLineCount,
    recentMessages: buildRecentMessages(session, originalInput, pollutedInput)
  };
}

function buildFallbackResponse(
  context: ReplyContext,
  desiredReplyLineCount: 1 | 2,
): TaReplyResponse {
  return {
    reply: getFallbackReply(
      context.session,
      desiredReplyLineCount,
      context.triggerKeyword,
      context.triggerReason,
      context.events
    ),
    source: "fallback"
  };
}

export async function buildReply(context: ReplyContext): Promise<string[]> {
  const desiredReplyLineCount = pickReplyLineCount();

  try {
    const result = await generateTaReply(createReplyRequest(context, desiredReplyLineCount));
    return result.reply;
  } catch (error) {
    console.warn("[ta-say] TA reply fell back to local copy.", error);
    return buildFallbackResponse(context, desiredReplyLineCount).reply;
  }
}

export async function streamReply(
  context: ReplyContext,
  onLine: (line: string) => void,
): Promise<TaReplyResponse> {
  const desiredReplyLineCount = pickReplyLineCount();
  const request = createReplyRequest(context, desiredReplyLineCount);

  try {
    return await streamTaReply(request, onLine);
  } catch (error) {
    console.warn("[ta-say] TA reply fell back to local copy.", error);
    const fallback = buildFallbackResponse(context, desiredReplyLineCount);
    fallback.reply.forEach((line) => onLine(line));
    return fallback;
  }
}
