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

export interface RelationshipInsightBlock {
  summary: string;
  traits: string[];
}

export interface RelationshipKeyMoment {
  title: string;
  quote: string;
  insight: string;
}

export interface RelationshipAdviceBlock {
  direction: string;
  doMore: string[];
  avoid: string[];
  nextStep: string;
}

export interface RelationshipAnalysisReport {
  summary: string;
  relationshipState: string;
  selfProfile: RelationshipInsightBlock;
  otherProfile: RelationshipInsightBlock;
  interactionPattern: string[];
  keyMoments: RelationshipKeyMoment[];
  mainIssues: string[];
  communicationAdvice: RelationshipAdviceBlock;
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
