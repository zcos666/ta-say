import type { StoryStage, TaPronoun } from "../../types/story";
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

