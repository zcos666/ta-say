import { beforeEach, describe, expect, it } from "vitest";
import { useAppStore } from "../src/app/store/useAppStore";
import { storageRepository } from "../src/services/storage/storageRepository";

describe("useAppStore replay state", () => {
  beforeEach(() => {
    storageRepository.clear();
    useAppStore.setState(useAppStore.getInitialState(), true);
  });

  it("新开一局时不会继承上一轮的读档次数", async () => {
    storageRepository.write({
      hasFinishedGame: false,
      loadCount: 3,
      metaMemory: ["旧记忆"],
      version: 2,
    });

    await useAppStore.getState().selectSetup("害怕说真话", "TA");

    expect(useAppStore.getState().session.loadCount).toBe(0);
    expect(useAppStore.getState().session.metaMemory).toEqual(["旧记忆"]);
  });

  it("重新开始时会把读档次数重置为当前轮次", () => {
    storageRepository.write({
      hasFinishedGame: true,
      loadCount: 2,
      metaMemory: ["旧记忆"],
      version: 2,
    });

    useAppStore.getState().resetForReplay();

    expect(useAppStore.getState().session.loadCount).toBe(0);
    expect(useAppStore.getState().session.metaMemory).toEqual(["旧记忆"]);
  });
});
