import { getFearFallbackCopy } from "../story/stageConfig";
import { findKeywordRule } from "./pollutionRules";
import type { FearType, StoryStage, TriggerReason } from "../../types/story";

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
  fearType: FearType | null;
  triggerReason?: TriggerReason;
  keyword?: string;
}

export function buildPollutionResult({
  userInput,
  stage,
  fearType,
  triggerReason,
  keyword
}: BuildPollutionParams): PollutionResult | null {
  if (!triggerReason) {
    return null;
  }

  const rule = keyword ? findKeywordRule(keyword) : findKeywordRule(userInput);
  const pollutedText = rule?.pollutedText ?? getFearFallbackCopy(fearType);

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
