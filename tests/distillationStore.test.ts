import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "../src/app/store/useAppStore";
import { storageRepository } from "../src/services/storage/storageRepository";

describe("distillation profiles in store", () => {
  beforeEach(() => {
    storageRepository.clear();
    useAppStore.setState(useAppStore.getInitialState(), true);
    vi.restoreAllMocks();
  });

  it("保存画像后，重新开始仍会保留最近一次蒸馏结果", () => {
    const persisted = {
      hasFinishedGame: true,
      loadCount: 1,
      metaMemory: ["旧记忆"],
      selfProfile: {
        subject: "self" as const,
        summary: "会延迟表达需求。",
        styleTags: ["克制"],
        emotionalTraits: ["容易压住情绪"],
        communicationHabits: ["先观察"],
        interactionPreferences: ["等对方先确认"],
        relationshipSignals: ["在意但表达偏晚"],
        evidence: [{ quote: "没事。", reason: "在收缩需求。" }],
      },
      otherProfile: {
        subject: "other" as const,
        summary: "回应偏慢，但并非完全抽离。",
        styleTags: ["慢热"],
        emotionalTraits: ["谨慎回应"],
        communicationHabits: ["需要缓冲时间"],
        interactionPreferences: ["不喜欢被追问"],
        relationshipSignals: ["会给回应，但节奏偏慢"],
        evidence: [{ quote: "我晚点回你。", reason: "说明并未直接断联。" }],
      },
      version: 2,
    };

    vi.spyOn(storageRepository, "read").mockReturnValue(persisted);
    vi.spyOn(storageRepository, "write").mockImplementation(() => {});
    vi.spyOn(storageRepository, "writeSession").mockImplementation(() => {});

    useAppStore.getState().saveDistilledProfiles({
      selfProfile: persisted.selfProfile,
      otherProfile: persisted.otherProfile,
    });
    useAppStore.getState().resetForReplay();

    expect(useAppStore.getState().session.selfProfile?.summary).toBe("会延迟表达需求。");
    expect(useAppStore.getState().session.otherProfile?.summary).toBe("回应偏慢，但并非完全抽离。");
  });
});
