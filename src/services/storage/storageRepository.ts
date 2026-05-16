import { STORAGE_KEYS, STORAGE_VERSION } from "../../config/storage";
import type { PersistedState, SessionState, ShareCardData } from "../../types/session";

const isBrowser = typeof window !== "undefined";

export const createInitialPersistedState = (): PersistedState => ({
  hasFinishedGame: false,
  loadCount: 0,
  metaMemory: [],
  version: STORAGE_VERSION,
});

export const createDefaultPersistedState = createInitialPersistedState;

function getStorage(): Storage | null {
  if (!isBrowser) {
    return null;
  }

  const candidate = window.localStorage as Partial<Storage> | undefined;

  if (
    !candidate ||
    typeof candidate.getItem !== "function" ||
    typeof candidate.setItem !== "function" ||
    typeof candidate.removeItem !== "function"
  ) {
    return null;
  }

  return candidate as Storage;
}

const safeRead = <T>(key: string, fallback: T): T => {
  const storage = getStorage();

  if (!storage) {
    return fallback;
  }

  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown) => {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(key, JSON.stringify(value));
};

const hasCurrentPersistedVersion = () => {
  const persisted = safeRead<Partial<PersistedState> | undefined>(STORAGE_KEYS.persisted, undefined);
  return persisted?.version === STORAGE_VERSION;
};

export const storageRepository = {
  read(): PersistedState {
    return this.readPersistedState();
  },
  write(state: PersistedState) {
    this.writePersistedState(state);
  },
  patch(partial: Partial<PersistedState>) {
    const current = this.readPersistedState();
    this.writePersistedState({
      ...current,
      ...partial,
      version: STORAGE_VERSION,
    });
  },
  clear() {
    const storage = getStorage();

    if (!storage) {
      return;
    }

    storage.removeItem(STORAGE_KEYS.session);
    storage.removeItem(STORAGE_KEYS.persisted);
    storage.removeItem(STORAGE_KEYS.latestShareCard);
  },
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
    safeWrite(STORAGE_KEYS.persisted, {
      ...createInitialPersistedState(),
      ...state,
      version: STORAGE_VERSION,
    });
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
