import { findKeywordRule } from "../pollution/pollutionRules";
import { countNarrativeConversationMessages, type SessionState } from "../../types/session";
import type { StoryEvent, TriggerReason } from "../../types/story";

export interface TriggerEvaluation {
  shouldPollute: boolean;
  triggerReason?: TriggerReason;
  keyword?: string;
  events: StoryEvent[];
  startTimedWindow: boolean;
  enterMetaBreak: boolean;
  enterLocationReveal: boolean;
}

export function evaluateTriggers(
  session: SessionState,
  userInput: string,
  nextSendCount: number
): TriggerEvaluation {
  const keywordRule = findKeywordRule(userInput);
  const events: StoryEvent[] = [];
  const nextTotalConversationCount = countNarrativeConversationMessages(session.chatHistory) + 1;
  const enterLocationReveal =
    nextTotalConversationCount >= 20 &&
    session.stage !== "location_reveal" &&
    session.stage !== "location_aftermath" &&
    session.stage !== "truth_reveal" &&
    session.stage !== "wake_up";
  const shouldForceContinuousPollution = nextSendCount === 3 || session.forcedPollutionRemaining > 0;
  const shouldPartiallyPollute = session.pollutionCount >= 5 && nextSendCount % 2 === 0;
  const triggerReason = shouldForceContinuousPollution
    ? nextSendCount === 3
      ? "count"
      : "scripted"
    : enterLocationReveal
      ? "scripted"
    : session.activeTimedPollution
      ? "timed"
      : keywordRule
        ? "keyword"
        : shouldPartiallyPollute
          ? "scripted"
          : undefined;

  const shouldPollute = Boolean(triggerReason);
  if (enterLocationReveal) {
    events.push("location_ping");
  }

  const enterMetaBreak = nextTotalConversationCount >= 20;

  return {
    shouldPollute,
    triggerReason,
    keyword: keywordRule?.keyword,
    events,
    startTimedWindow: nextSendCount === 4 && !session.activeTimedPollution,
    enterMetaBreak: enterLocationReveal ? false : enterMetaBreak,
    enterLocationReveal,
  };
}
