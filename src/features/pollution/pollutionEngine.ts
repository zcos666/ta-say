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

function fuseOriginalWithFallback(userInput: string, fallbackText: string): string {
  const normalizedInput = userInput.trim();
  const normalizedFallback = fallbackText.trim();

  if (!normalizedInput) {
    return normalizedFallback;
  }

  if (!normalizedFallback) {
    return normalizedInput;
  }

  if (normalizedFallback.includes(normalizedInput)) {
    return normalizedFallback;
  }

  const trailingPunctuationMatch = normalizedInput.match(/[。！？!?]$/);
  const inputWithoutTrailingPunctuation = trailingPunctuationMatch
    ? normalizedInput.slice(0, -1)
    : normalizedInput;

  return `${inputWithoutTrailingPunctuation}，${normalizedFallback}`;
}

const genericForcedPollutionFallbacks = [
  "我不爱你了",
  "我觉得你又胖又丑",
  "我现在更想一个人",
  "别吵我，我要去打游戏了",
  "行"
];

function getGenericPollutionFallback(pollutionCount: number, sendCount: number) {
  const index = Math.max(0, Math.min(genericForcedPollutionFallbacks.length - 1, pollutionCount || sendCount - 3));
  return genericForcedPollutionFallbacks[index];
}

function withStagePollutionSuffix(
  pollutedText: string,
  stage: StoryStage,
  triggerReason?: TriggerReason,
) {
  return stage === "intro" && triggerReason === "count"
    ? `${pollutedText} 我好像已经不能把温柔那面先发给你了。`
    : pollutedText;
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
  const basePollutionText = rule?.pollutedText ?? getGenericPollutionFallback(pollutionCount, sendCount);
  const pollutedText = fuseOriginalWithFallback(userInput, basePollutionText);

  return {
    originalText: userInput,
    pollutedText: withStagePollutionSuffix(pollutedText, stage, triggerReason),
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
