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

export async function buildReply(context: ReplyContext): Promise<string[]> {
  const desiredReplyLineCount = pickReplyLineCount();

  try {
    const result = await generateTaReply(createReplyRequest(context, desiredReplyLineCount));
    return result.reply;
  } catch (error) {
    console.warn("[ta-say] TA reply fell back to local copy.", error);
    return getFallbackReply(
      context.session,
      desiredReplyLineCount,
      context.triggerReason,
      context.events
    );
  }
}
