import type { SessionState } from "../../types/session";
import type { StoryEvent, StoryStage, TriggerReason } from "../../types/story";

interface StageTransitionInput {
  session: SessionState;
  nextSendCount?: number;
  triggerReason?: TriggerReason;
  events?: StoryEvent[];
  enterMetaBreak?: boolean;
}

export function deriveNextStage({
  session,
  nextSendCount = session.sendCount,
  triggerReason,
  events = [],
  enterMetaBreak = false
}: StageTransitionInput): StoryStage {
  if (events.includes("location_ping")) {
    return "location_reveal";
  }

  if (enterMetaBreak) {
    return "meta_break";
  }

  if (events.includes("draft_exposed")) {
    return "draft_exposed";
  }

  if (triggerReason === "timed") {
    return "time_pollution";
  }

  if (
    triggerReason &&
    (session.stage === "intro" || session.stage === "normal_chat")
  ) {
    return "first_pollution";
  }

  if (session.stage === "first_pollution" && !triggerReason && session.forcedPollutionRemaining <= 0) {
    return "normal_chat";
  }

  if (session.stage === "time_pollution" && !triggerReason) {
    return "normal_chat";
  }

  if (session.stage === "intro" && nextSendCount >= 2) {
    return "normal_chat";
  }

  return session.stage;
}
