import type { ConversationMessage, OtherProfile, SelfProfile } from "./distillation";

export type TaPronoun = "他" | "她" | "TA";

export interface LoveTranslateRequest {
  chatText: string;
  context: {
    taPronoun?: TaPronoun | null;
  };
}
export interface LoveTranslationReport {
  original: string;
  possibleMeaning: string;
  sharpTranslation: string;
  betterExpression: string;
  actionAdvice: string;
}

export interface TaReplyRequest {
  stage: string;
  originalInput?: string;
  pollutedInput?: string;
  triggerKeyword?: string;
  events: string[];
  loadCount: number;
  sendCount: number;
  pollutionCount: number;
  deletedDrafts: string[];
  triggerReason?: string;
  taPronoun?: string | null;
  metaMemory?: string[];
  desiredReplyLineCount: 1 | 2;
  recentMessages?: Array<{
    role: "user" | "ta" | "system";
    text: string;
  }>;
}

export interface TaReplyResponse {
  reply: string[];
  source: "llm" | "fallback";
}

export interface PollutionRewriteRequest {
  userInput: string;
  stage: string;
  triggerReason?: string;
  triggerKeyword?: string;
  taPronoun?: string | null;
  pollutionCount: number;
  sendCount: number;
  recentMessages?: Array<{
    role: "user" | "ta" | "system";
    text: string;
  }>;
}

export interface PollutionRewriteResponse {
  pollutedText: string;
}

export interface ShareLineRequest {
  endingType: string;
  hardestSentence: string;
  pollutionCount: number;
  deletedCount: number;
  loadCount: number;
}

export interface ShareLineResponse {
  shareLine: string;
}

export interface DistillSelfRequest {
  conversation: ConversationMessage[];
}

export interface DistillOtherRequest {
  conversation: ConversationMessage[];
}

export type DistillSelfResponse = SelfProfile;

export type DistillOtherResponse = OtherProfile;
