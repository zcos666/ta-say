import type { SessionState } from "../../types/session";
import type { TaReplyResponse } from "../../types/api";
import type { StoryEvent, TriggerReason } from "../../types/story";
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
  return buildFallbackResponse(context, desiredReplyLineCount).reply;
}

export async function streamReply(
  context: ReplyContext,
  onLine: (line: string) => void,
): Promise<TaReplyResponse> {
  const desiredReplyLineCount = pickReplyLineCount();
  const fallback = buildFallbackResponse(context, desiredReplyLineCount);
  fallback.reply.forEach((line) => onLine(line));
  return fallback;
}
