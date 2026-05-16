import { create } from "zustand";
import { STORAGE_VERSION } from "../../config/storage";
import { storageRepository } from "../../services/storage/storageRepository";
import type { LoveTranslationReport } from "../../types/api";
import type { SessionState, SessionStore, ShareCardData } from "../../types/session";

const initialSessionState: SessionState = {
  fearType: null,
  taPronoun: "TA",
  stage: "intro",
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

const hydratedState = storageRepository.readSession(initialSessionState);

export const useSessionStore = create<SessionStore>((set) => ({
  ...hydratedState,
  resetSession: () => {
    set(initialSessionState);
    storageRepository.writeSession(initialSessionState);
    storageRepository.writePersistedState({
      hasFinishedGame: initialSessionState.hasFinishedGame,
      loadCount: initialSessionState.loadCount,
      metaMemory: initialSessionState.metaMemory,
      shareCardData: initialSessionState.shareCardData,
      version: STORAGE_VERSION,
    });
  },
  patchSession: (patch) => {
    set((state) => {
      const nextState = { ...state, ...patch };
      storageRepository.writeSession(nextState);
      storageRepository.writePersistedState({
        hasFinishedGame: nextState.hasFinishedGame,
        loadCount: nextState.loadCount,
        metaMemory: nextState.metaMemory,
        shareCardData: nextState.shareCardData,
        version: STORAGE_VERSION,
      });
      return nextState;
    });
  },
  saveTranslatorReport: (report: LoveTranslationReport) => {
    set((state) => {
      const nextState = { ...state, translatorReport: report };
      storageRepository.writeSession(nextState);
      return nextState;
    });
  },
  saveShareCardData: (data: ShareCardData) => {
    set((state) => {
      const nextState = { ...state, shareCardData: data };
      storageRepository.writeSession(nextState);
      storageRepository.saveLatestShareCard(data);
      storageRepository.writePersistedState({
        hasFinishedGame: nextState.hasFinishedGame,
        loadCount: nextState.loadCount,
        metaMemory: nextState.metaMemory,
        shareCardData: data,
        version: STORAGE_VERSION,
      });
      return nextState;
    });
  },
  unlockTranslator: () => {
    set((state) => {
      const nextState = {
        ...state,
        hasFinishedGame: true,
        stage: "translator_unlocked" as const,
      };
      storageRepository.writeSession(nextState);
      return nextState;
    });
  },
}));
