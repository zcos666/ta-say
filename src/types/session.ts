import type { FearType, LoveTranslationReport, TaPronoun } from "./api";
import type { StoryStage } from "./story";

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

export interface SessionSnapshot {
  stage: StoryStage;
  chatHistory: ChatMessage[];
  sendCount: number;
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

export interface PersistedState {
  hasFinishedGame: boolean;
  autoSaveSnapshot?: SessionSnapshot;
  loadCount: number;
  metaMemory: string[];
  shareCardData?: ShareCardData;
  version: number;
}

export interface SessionStore extends SessionState {
  resetSession: () => void;
  patchSession: (patch: Partial<SessionState>) => void;
  saveTranslatorReport: (report: LoveTranslationReport) => void;
  saveShareCardData: (data: ShareCardData) => void;
  unlockTranslator: () => void;
}
