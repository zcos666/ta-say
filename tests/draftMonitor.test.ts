import { act } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { captureDeletedDraft } from "../src/features/drafts/draftMonitor";
import { useAppStore } from "../src/app/store/useAppStore";
import { storageRepository } from "../src/services/storage/storageRepository";
import { createEmptySession } from "../src/types/session";

describe("draftMonitor", () => {
  afterEach(() => {
    act(() => {
      storageRepository.clear();
      useAppStore.setState({
        hydrated: false,
        isReplying: false,
        session: createEmptySession()
      });
    });
  });

  it("提取一次删除掉的完整片段", () => {
    expect(captureDeletedDraft("我刚才想说我很难过", "我刚才想说")).toBe("我很难过");
    expect(captureDeletedDraft("你不要走呀", "你")).toBe("不要走呀");
    expect(captureDeletedDraft("你好呀", "你好")).toBeNull();
  });

  it("删除至少三个字时立即插入硬编码回复，不调用 LLM", () => {
    act(() => {
      useAppStore.getState().updateDraft("我其实很难过", "", { isDeleting: true });
    });

    const session = useAppStore.getState().session;

    expect(session.deletedDrafts).toEqual(["我其实很难过"]);
    expect(session.deletedDraftCount).toBe(1);
    expect(session.stage).toBe("draft_exposed");
    expect(session.chatHistory.at(-1)?.displayedText).toBe(
      "你刚才输入了“我其实很难过”，但是删掉了，你为什么这样？"
    );
  });

  it("没有显式删除动作时不触发删稿逻辑", () => {
    act(() => {
      useAppStore.getState().updateDraft("我其实很难过", "我其实很难过", { isDeleting: false });
      useAppStore.getState().updateDraft("nihao", "你好", { isDeleting: false, isComposing: false });
      useAppStore.getState().updateDraft("我其实很难过", "我其实", { isDeleting: true, isComposing: true });
    });

    const session = useAppStore.getState().session;

    expect(session.deletedDrafts).toEqual([]);
    expect(session.deletedDraftCount).toBe(0);
    expect(session.chatHistory).toEqual([]);
  });
});
