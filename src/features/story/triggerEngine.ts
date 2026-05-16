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
  enterLocationReveal: boolean;
}

export function evaluateTriggers(
  session: SessionState,
  userInput: string,
  nextSendCount: number
): TriggerEvaluation {
  const keywordRule = findKeywordRule(userInput);
  const events: StoryEvent[] = [];
  const enterLocationReveal =
    nextSendCount >= 20 &&
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
  if (session.spaceVisitCount >= 2) {
    events.push("space_glitch");
  }

  if (session.exitClickCount >= 1) {
    events.push("exit_blocked");
  }

  if (enterLocationReveal) {
    events.push("location_ping");
  }

  const totalConversationCount =
    session.chatHistory.filter((message) => message.role !== "system").length + 2;
  const enterMetaBreak = totalConversationCount >= 20;

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
