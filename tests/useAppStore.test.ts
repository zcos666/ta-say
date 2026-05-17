import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "../src/app/store/useAppStore";
import { storageRepository } from "../src/services/storage/storageRepository";

describe("useAppStore replay state", () => {
  beforeEach(() => {
    storageRepository.clear();
    useAppStore.setState(useAppStore.getInitialState(), true);
    vi.restoreAllMocks();
  });

  it("新开一局时不会继承上一轮的读档次数", async () => {
    const persisted = {
      hasFinishedGame: false,
      loadCount: 3,
      metaMemory: ["旧记忆"],
      version: 2,
    };
    vi.spyOn(storageRepository, "read").mockReturnValue(persisted);
    vi.spyOn(storageRepository, "write").mockImplementation(() => {});
    vi.spyOn(storageRepository, "writeSession").mockImplementation(() => {});

    await useAppStore.getState().selectSetup("TA");

    expect(useAppStore.getState().session.loadCount).toBe(0);
    expect(useAppStore.getState().session.metaMemory).toEqual(["旧记忆"]);
  });

  it("重新开始时会把读档次数重置为当前轮次", () => {
    const persisted = {
      hasFinishedGame: true,
      loadCount: 2,
      metaMemory: ["旧记忆"],
      version: 2,
    };
    vi.spyOn(storageRepository, "read").mockReturnValue(persisted);
    vi.spyOn(storageRepository, "write").mockImplementation(() => {});
    vi.spyOn(storageRepository, "writeSession").mockImplementation(() => {});
    vi.spyOn(storageRepository, "readSession").mockReturnValue(useAppStore.getState().session);

    useAppStore.getState().resetForReplay();

    expect(useAppStore.getState().session.loadCount).toBe(0);
    expect(useAppStore.getState().session.metaMemory).toEqual(["旧记忆"]);
  });
});
