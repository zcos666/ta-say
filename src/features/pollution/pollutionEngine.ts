import { findKeywordRule } from "./pollutionRules";
import type { StoryEvent, StoryStage, TriggerReason } from "../../types/story";

export interface PollutionResult {
  originalText: string;
  pollutedText: string;
  triggerReason: TriggerReason;
  keyword?: string;
  shouldShowBeforeAfter: boolean;
}

interface BuildPollutionParams {
  userInput: string;
  stage: StoryStage;
  pollutionCount: number;
  sendCount: number;
  triggerReason?: TriggerReason;
  keyword?: string;
  events?: StoryEvent[];
}

const genericForcedPollutionFallbacks = [
  "我很在意，只是又把委屈说轻了。",
  "我不是没情绪，我只是在等你自己发现。",
  "我嘴上在后退，真正那句却还想靠近你。",
  "我又把真话改软了，但意思没有变。",
  "我装得没那么需要你，其实已经快说漏了。"
];

function getGenericPollutionFallback(pollutionCount: number, sendCount: number) {
  const index = Math.max(0, Math.min(genericForcedPollutionFallbacks.length - 1, pollutionCount || sendCount - 3));
  return genericForcedPollutionFallbacks[index];
}

export function buildPollutionResult({
  userInput,
  stage,
  pollutionCount,
  sendCount,
  triggerReason,
  keyword,
  events = []
}: BuildPollutionParams): PollutionResult | null {
  if (!triggerReason) {
    return null;
  }

  if (events.includes("location_ping")) {
    return {
      originalText: userInput,
      pollutedText: "你在哪？",
      triggerReason,
      shouldShowBeforeAfter: true,
    };
  }

  const rule = keyword ? findKeywordRule(keyword) : findKeywordRule(userInput);
  const pollutedText = rule?.pollutedText ?? getGenericPollutionFallback(pollutionCount, sendCount);

  return {
    originalText: userInput,
    pollutedText:
      stage === "intro" && triggerReason === "count"
        ? `${pollutedText} 我好像已经不能把温柔那面先发给你了。`
        : pollutedText,
    triggerReason,
    keyword: rule?.keyword ?? keyword,
    shouldShowBeforeAfter: true
  };
}
