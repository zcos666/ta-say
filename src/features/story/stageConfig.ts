import type { FearType, StoryStage, TaPronoun } from "../../types/story";
import { createChatMessage, type ChatMessage } from "../../types/session";
import { storyCopy, uiCopy } from "../../config/hardcodedCopy";

export function createIntroMessages(pronoun: TaPronoun | null): ChatMessage[] {
  return storyCopy.introLines(pronoun).map((line) => createChatMessage("ta", line));
}

export const truthLines = storyCopy.truthLines;

export const wakeLines = storyCopy.wakeLines;

export function getSpacePosts(visitCount: number): string[] {
  if (visitCount >= 3) {
    return [...storyCopy.brokenSpacePosts];
  }

  if (visitCount >= 2) {
    return [...storyCopy.strangeSpacePosts];
  }

  return [...storyCopy.normalSpacePosts];
}

export function getStageStatus(stage: StoryStage): string {
  return uiCopy.stageStatus[stage] ?? uiCopy.stageStatus.default;
}

export function getFearFallbackCopy(fearType: FearType | null): string {
  switch (fearType) {
    case "害怕被抛下":
      return "我不是不在乎，我只是先假装你不会离开。";
    case "害怕被控制":
      return "我嘴上说随便，其实每一步都怕被你决定。";
    case "害怕说真话":
      return "我不是没有真话，我只是习惯把它吞回去。";
    default:
      return "我已经把真正的意思说出来了，你还要继续装作没看见吗？";
  }
}
