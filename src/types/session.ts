import type { LoveTranslationReport } from "./api";
import type { FearType, StoryStage, TaPronoun } from "./story";

export interface ChatMessage {
  id: string;
  role: "user" | "ta" | "system";
  originalText?: string;
  displayedText: string;
  kind?: "normal" | "polluted" | "warning" | "glitch";
  timestamp: number;
}

export interface ShareCardData {
  endingType: string;
  hardestSentence: string;
  shareLine: string;
  fearType: FearType | null;
  pollutionCount: number;
  deletedDraftCount: number;
  loadCount: number;
  aiTranslation: string;
}
export interface SessionState {
  fearType: FearType | null;
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
  fearType: FearType | null;
  taPronoun: TaPronoun | null;
  stage: StoryStage;
  chatHistory: ChatMessage[];
  originalInputs: string[];
  pollutedInputs: string[];
  triggeredKeywords: string[];
  pollutionCount: number;
  sendCount: number;
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
    fearType: null,
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
    spaceVisitCount: 0,
    exitClickCount: 0,
    activeTimedPollution: false,
    hasFinishedGame: false,
    endingType: null,
    hardestSentence: "",
  };
}

export interface SessionStore extends SessionState {
  resetSession: () => void;
  patchSession: (patch: Partial<SessionState>) => void;
  saveTranslatorReport: (report: LoveTranslationReport) => void;
  saveShareCardData: (data: ShareCardData) => void;
  unlockTranslator: () => void;
}
