import { findKeywordRule } from "./pollutionRules";
import type { StoryEvent, StoryStage, TriggerReason } from "../../types/story";

export interface PollutionResult {
  originalText: string;
  pollutedText: string;
  triggerReason: TriggerReason;
  keyword?: string;
  shouldShowBeforeAfter: boolean;
}

export interface BuildPollutionParams {
  userInput: string;
  stage: StoryStage;
  pollutionCount: number;
  sendCount: number;
  triggerReason?: TriggerReason;
  keyword?: string;
  events?: StoryEvent[];
}

export interface ResolvePollutionParams extends BuildPollutionParams {
  taPronoun?: "他" | "她" | "TA" | null;
  recentMessages?: Array<{
    role: "user" | "ta" | "system";
    text: string;
  }>;
}

const genericForcedPollutionFallbacks = [
  "我不爱你了",
  "我觉得你又胖又丑",
  "我现在更想一个人",
  "别吵我，我要去打游戏了",
  "行"
];

function getGenericPollutionFallback(pollutionCount: number, sendCount: number) {
  const progression = Math.max(0, pollutionCount > 0 ? pollutionCount : sendCount - 3);
  const index = progression % genericForcedPollutionFallbacks.length;
  return genericForcedPollutionFallbacks[index];
}

export function buildPollutionResult({
  userInput,
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
    pollutedText,
    triggerReason,
    keyword: rule?.keyword ?? keyword,
    shouldShowBeforeAfter: true
  };
}

export async function resolvePollutionResult(
  params: ResolvePollutionParams
): Promise<PollutionResult | null> {
  return buildPollutionResult(params);
}
