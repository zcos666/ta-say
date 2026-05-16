import { findKeywordRule } from "../pollution/pollutionRules";
import type { SessionState } from "../../types/session";
import type { StoryEvent, TriggerReason } from "../../types/story";

export interface TriggerEvaluation {
  shouldPollute: boolean;
  triggerReason?: TriggerReason;
  keyword?: string;
  events: StoryEvent[];
  startTimedWindow: boolean;
  enterMetaBreak: boolean;
}

export function evaluateTriggers(
  session: SessionState,
  userInput: string,
  nextSendCount: number
): TriggerEvaluation {
  const keywordRule = findKeywordRule(userInput);
  const events: StoryEvent[] = [];
  const triggerReason = keywordRule
    ? "keyword"
    : nextSendCount === 3
      ? "count"
      : session.activeTimedPollution
        ? "timed"
        : undefined;

  const shouldPollute = Boolean(triggerReason);
  const shouldExposeDraft =
    session.deletedDraftCount > 0 && nextSendCount >= 4 && session.stage !== "draft_exposed";

  if (shouldExposeDraft) {
    events.push("draft_exposed");
  }

  if (session.spaceVisitCount >= 2) {
    events.push("space_glitch");
  }

  if (session.exitClickCount >= 1) {
    events.push("exit_blocked");
  }

  const enterMetaBreak =
    session.loadCount >= 3 || session.spaceVisitCount >= 3 || session.exitClickCount >= 3;

  return {
    shouldPollute,
    triggerReason,
    keyword: keywordRule?.keyword,
    events,
    startTimedWindow: nextSendCount === 4 && !session.activeTimedPollution,
    enterMetaBreak
  };
}
