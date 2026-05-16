import { STORAGE_KEYS, STORAGE_VERSION } from "../../config/storage";
import type { PersistedState, SessionState, ShareCardData } from "../../types/session";

const isBrowser = typeof window !== "undefined";

export const createInitialPersistedState = (): PersistedState => ({
  hasFinishedGame: false,
  loadCount: 0,
  metaMemory: [],
  version: STORAGE_VERSION,
});

const safeRead = <T>(key: string, fallback: T): T => {
  if (!isBrowser) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown) => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const hasCurrentPersistedVersion = () => {
  const persisted = safeRead<Partial<PersistedState> | undefined>(STORAGE_KEYS.persisted, undefined);
  return persisted?.version === STORAGE_VERSION;
};

export const storageRepository = {
  readSession(initialState: SessionState): SessionState {
    if (!hasCurrentPersistedVersion()) {
      return initialState;
    }

    return safeRead(STORAGE_KEYS.session, initialState);
  },
  writeSession(state: SessionState) {
    safeWrite(STORAGE_KEYS.session, state);
  },
  readPersistedState() {
    const persisted = safeRead(STORAGE_KEYS.persisted, createInitialPersistedState());
    return persisted.version === STORAGE_VERSION ? persisted : createInitialPersistedState();
  },
  writePersistedState(state: PersistedState) {
    safeWrite(STORAGE_KEYS.persisted, state);
  },
  saveLatestShareCard(data: ShareCardData) {
    safeWrite(STORAGE_KEYS.latestShareCard, data);
  },
  readLatestShareCard(): ShareCardData | undefined {
    if (!hasCurrentPersistedVersion()) {
      return undefined;
    }

    return safeRead<ShareCardData | undefined>(STORAGE_KEYS.latestShareCard, undefined);
  },
};
