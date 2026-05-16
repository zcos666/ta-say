import type { PersistedState } from "../../types/session";

const STORAGE_KEY = "ta-say.persisted";
const STORAGE_VERSION = 1;

export function createDefaultPersistedState(): PersistedState {
  return {
    hasFinishedGame: false,
    loadCount: 0,
    metaMemory: [],
    version: STORAGE_VERSION
  };
}

function getStorage(): Storage | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

export const storageRepository = {
  read(): PersistedState {
    const storage = getStorage();

    if (!storage) {
      return createDefaultPersistedState();
    }

    const raw = storage.getItem(STORAGE_KEY);

    if (!raw) {
      return createDefaultPersistedState();
    }

    try {
      return {
        ...createDefaultPersistedState(),
        ...JSON.parse(raw)
      } as PersistedState;
    } catch {
      return createDefaultPersistedState();
    }
  },

  write(nextState: PersistedState) {
    const storage = getStorage();

    if (!storage) {
      return;
    }

    storage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  },

  patch(partial: Partial<PersistedState>) {
    const current = this.read();
    this.write({
      ...current,
      ...partial,
      version: STORAGE_VERSION
    });
  },

  clear() {
    const storage = getStorage();

    if (!storage) {
      return;
    }

    storage.removeItem(STORAGE_KEY);
  }
};
