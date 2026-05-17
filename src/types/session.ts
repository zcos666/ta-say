import type { LoveTranslationReport } from "./api";
import type { OtherProfile, SelfProfile } from "./distillation";
import type { StoryStage, TaPronoun } from "./story";

export interface ChatMessage {
  id: string;
  role: "user" | "ta" | "system";
  originalText?: string;
  displayedText: string;
  mediaUrl?: string;
  kind?:
    | "normal"
    | "polluted"
    | "warning"
    | "glitch"
    | "space_notice"
    | "location_notice"
    | "monitor_image"
    | "pending";
  timestamp: number;
}

export interface ShareCardData {
  endingType: string;
  hardestSentence: string;
  shareLine: string;
  pollutionCount: number;
  deletedDraftCount: number;
  loadCount: number;
  aiTranslation: string;
  dreamReferenceText?: string;
  translatorContextText?: string;
}
export interface SessionState {
  taPronoun: TaPronoun | null;
  stage: StoryStage;
  chatHistory: ChatMessage[];
  originalInputs: string[];
  pollutedInputs: string[];
  triggeredKeywords: string[];
  deletedDrafts: string[];
  metaMemory: string[];
  pollutionCount: number;
  deletedDraftCount: number;
  loadCount: number;
  sendCount: number;
  forcedPollutionRemaining: number;
  spaceVisitCount: number;
  exitClickCount: number;
  activeTimedPollution: boolean;
  hasFinishedGame: boolean;
  endingType: string | null;
  hardestSentence: string;
  translatorReport?: LoveTranslationReport;
  selfProfile?: SelfProfile;
  otherProfile?: OtherProfile;
  shareCardData?: ShareCardData;
}

export interface SessionSnapshot {
  taPronoun: TaPronoun | null;
  stage: StoryStage;
  chatHistory: ChatMessage[];
  originalInputs: string[];
  pollutedInputs: string[];
  triggeredKeywords: string[];
  pollutionCount: number;
  sendCount: number;
  forcedPollutionRemaining: number;
  activeTimedPollution: boolean;
}
export interface PersistedState {
  hasFinishedGame: boolean;
  autoSaveSnapshot?: SessionSnapshot;
  loadCount: number;
  metaMemory: string[];
  selfProfile?: SelfProfile;
  otherProfile?: OtherProfile;
  shareCardData?: ShareCardData;
  version: number;
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createChatMessage(
  role: ChatMessage["role"],
  displayedText: string,
  options: Partial<Pick<ChatMessage, "originalText" | "kind" | "mediaUrl">> = {},
): ChatMessage {
  return {
    id: createId(),
    role,
    displayedText,
    originalText: options.originalText,
    mediaUrl: options.mediaUrl,
    kind: options.kind ?? "normal",
    timestamp: Date.now(),
  };
}

export function createEmptySession(): SessionState {
  return {
    taPronoun: null,
    stage: "start",
    chatHistory: [],
    originalInputs: [],
    pollutedInputs: [],
    triggeredKeywords: [],
    deletedDrafts: [],
    metaMemory: [],
    pollutionCount: 0,
    deletedDraftCount: 0,
    loadCount: 0,
    sendCount: 0,
    forcedPollutionRemaining: 0,
    spaceVisitCount: 0,
    exitClickCount: 0,
    activeTimedPollution: false,
    hasFinishedGame: false,
    endingType: null,
    hardestSentence: "",
  };
}

export function countNarrativeConversationMessages(messages: ChatMessage[]): number {
  return messages.filter((message) => message.role !== "system" && message.kind !== "pending").length;
}

export function isLlmContextMessage(message: ChatMessage): boolean {
  if (message.role === "system") {
    return false;
  }

  return !["space_notice", "location_notice", "monitor_image", "pending"].includes(message.kind ?? "normal");
}
