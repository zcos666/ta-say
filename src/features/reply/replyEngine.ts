import type { SessionState } from "../../types/session";
import type { TaReplyRequest } from "../../types/api";
import type { StoryEvent, TriggerReason } from "../../types/story";
import { generateTaReply } from "../../services/api/llmClient";
import { getFallbackReply } from "./replyFallbacks";

interface ReplyContext {
  session: SessionState;
  originalInput?: string;
  pollutedInput?: string;
  triggerReason?: TriggerReason;
  events?: StoryEvent[];
}

function createReplyRequest({
  session,
  originalInput,
  pollutedInput,
  triggerReason,
  events = []
}: ReplyContext): TaReplyRequest {
  return {
    stage: session.stage,
    originalInput,
    pollutedInput,
    events,
    loadCount: session.loadCount,
    deletedDrafts: session.deletedDrafts,
    triggerReason,
    fearType: session.fearType,
    taPronoun: session.taPronoun,
    metaMemory: session.metaMemory,
    recentMessages: session.chatHistory.slice(-6).map((message) => ({
      role: message.role,
      text: message.displayedText
    }))
  };
}

export async function buildReply(context: ReplyContext): Promise<string[]> {
  try {
    const result = await generateTaReply(createReplyRequest(context));
    return result.reply;
  } catch {
    return getFallbackReply(context.session, context.triggerReason, context.events);
  }
}
