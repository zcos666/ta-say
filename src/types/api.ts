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
  events: string[];
  loadCount: number;
  deletedDrafts: string[];
  triggerReason?: string;
  fearType?: string | null;
  taPronoun?: string | null;
  metaMemory?: string[];
  recentMessages?: Array<{
    role: "user" | "ta" | "system";
    text: string;
  }>;
}

export interface TaReplyResponse {
  reply: string[];
  source: "llm" | "fallback";
}

export interface ShareCardData {
  endingType: string;
  hardestSentence: string;
  shareLine: string;
  pollutionCount: number;
  deletedDraftCount: number;
  loadCount: number;
  fearType: string;
  aiTranslation: string;
}
