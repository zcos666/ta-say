import type { SessionState } from "../../types/session";
import type { StoryEvent, TriggerReason } from "../../types/story";
import { fallbackReplyCopy } from "../../config/hardcodedCopy";

function chooseByCount(pool: { one: string[]; two: Array<[string, string]> }, desiredReplyLineCount: 1 | 2): string[] {
  if (desiredReplyLineCount === 1) {
    return [pool.one[0] ?? fallbackReplyCopy.defaults.one];
  }

  const pair = pool.two[0] ?? fallbackReplyCopy.defaults.two;
  return [...pair];
}

export function getFallbackReply(
  session: SessionState,
  desiredReplyLineCount: 1 | 2,
  triggerKeyword?: string,
  triggerReason?: TriggerReason,
  events: StoryEvent[] = []
): string[] {
  if (events.includes("load_restored")) {
    return chooseByCount(fallbackReplyCopy.events.load_restored, desiredReplyLineCount);
  }

  if (events.includes("load_failed")) {
    return chooseByCount(fallbackReplyCopy.events.load_failed, desiredReplyLineCount);
  }

  if (events.includes("load_warning")) {
    return chooseByCount(fallbackReplyCopy.events.load_warning, desiredReplyLineCount);
  }

  if (events.includes("draft_exposed")) {
    return chooseByCount(fallbackReplyCopy.events.draft_exposed, desiredReplyLineCount);
  }

  if (events.includes("hesitation_noticed")) {
    return chooseByCount(fallbackReplyCopy.events.hesitation_noticed, desiredReplyLineCount);
  }

  if (events.includes("space_glitch")) {
    return chooseByCount(fallbackReplyCopy.events.space_glitch, desiredReplyLineCount);
  }

  if (events.includes("exit_blocked")) {
    return chooseByCount(fallbackReplyCopy.events.exit_blocked, desiredReplyLineCount);
  }

  if (triggerReason === "keyword" && triggerKeyword && fallbackReplyCopy.keywords[triggerKeyword as keyof typeof fallbackReplyCopy.keywords]) {
    return chooseByCount(
      fallbackReplyCopy.keywords[triggerKeyword as keyof typeof fallbackReplyCopy.keywords],
      desiredReplyLineCount
    );
  }

  if (triggerReason === "keyword") {
    return chooseByCount(fallbackReplyCopy.triggerReason.keyword, desiredReplyLineCount);
  }

  if (triggerReason === "count" || triggerReason === "scripted") {
    return chooseByCount(
      session.pollutionCount >= 5
        ? fallbackReplyCopy.triggerReason.latePollution
        : fallbackReplyCopy.triggerReason.earlyPollution,
      desiredReplyLineCount
    );
  }

  if (triggerReason === "timed") {
    return chooseByCount(fallbackReplyCopy.triggerReason.timed, desiredReplyLineCount);
  }

  switch (session.stage) {
    case "intro":
      return chooseByCount(fallbackReplyCopy.stage.intro, desiredReplyLineCount);
    case "normal_chat":
      return chooseByCount(fallbackReplyCopy.stage.normal_chat, desiredReplyLineCount);
    case "draft_exposed":
      return chooseByCount(fallbackReplyCopy.stage.draft_exposed, desiredReplyLineCount);
    case "first_pollution":
      return chooseByCount(
        session.pollutionCount >= 5
          ? fallbackReplyCopy.stage.first_pollution_late
          : fallbackReplyCopy.stage.first_pollution_early,
        desiredReplyLineCount
      );
    case "save_loaded_once":
    case "save_loaded_twice":
      return chooseByCount(fallbackReplyCopy.stage.save_loaded, desiredReplyLineCount);
    default:
      return chooseByCount(fallbackReplyCopy.stage.default, desiredReplyLineCount);
  }
}
