import type { SessionState } from "../../types/session";
import type { TaReplyRequest, TaReplyResponse } from "../../types/api";
import type { StoryEvent, TriggerReason } from "../../types/story";
import { generateTaReply, streamTaReply } from "../../services/api/llmClient";
import { getFallbackReply } from "./replyFallbacks";

interface ReplyContext {
  session: SessionState;
  originalInput?: string;
  pollutedInput?: string;
  triggerReason?: TriggerReason;
  events?: StoryEvent[];
}

function pickReplyLineCount(): 1 | 2 {
  return Math.random() < 0.5 ? 1 : 2;
}

function createReplyRequest({
  session,
  originalInput,
  pollutedInput,
  triggerReason,
  events = []
}: ReplyContext, desiredReplyLineCount: 1 | 2): TaReplyRequest {
  return {
    stage: session.stage,
    originalInput,
    pollutedInput,
    events,
    loadCount: session.loadCount,
    sendCount: session.sendCount,
    pollutionCount: session.pollutionCount,
    deletedDrafts: session.deletedDrafts,
    triggerReason,
    taPronoun: session.taPronoun,
    metaMemory: session.metaMemory,
    desiredReplyLineCount,
    recentMessages: session.chatHistory.slice(-6).map((message) => ({
      role: message.role,
      text: message.displayedText
    }))
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
