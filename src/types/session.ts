import type { LoveTranslationReport } from "./api";
import type { StoryStage, TaPronoun } from "./story";

export interface ChatMessage {
  id: string;
  role: "user" | "ta" | "system";
  originalText?: string;
  displayedText: string;
  kind?: "normal" | "polluted" | "warning" | "glitch" | "space_notice" | "location_notice" | "pending";
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
  shareCardData?: ShareCardData;
  version: number;
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createChatMessage(
  role: ChatMessage["role"],
  displayedText: string,
  options: Partial<Pick<ChatMessage, "originalText" | "kind">> = {},
): ChatMessage {
  return {
    id: createId(),
    role,
    displayedText,
    originalText: options.originalText,
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
