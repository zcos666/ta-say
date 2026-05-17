export type FearType = "害怕被抛下" | "害怕被控制" | "害怕说真话";
export type TaPronoun = "他" | "她" | "TA";

export interface LoveTranslateRequest {
  chatText: string;
  context: {
    fearType: FearType | null;
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
