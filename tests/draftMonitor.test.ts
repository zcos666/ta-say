import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { draftCopy } from "../src/config/hardcodedCopy";
import { captureDeletedDraft, extractDeletedDraftSegment } from "../src/features/drafts/draftMonitor";
import { useAppStore } from "../src/app/store/useAppStore";
import { storageRepository } from "../src/services/storage/storageRepository";
import { createEmptySession } from "../src/types/session";

describe("draftMonitor", () => {
  function getExpectedReply(deletedDraft: string) {
    return draftCopy.buildImmediateReply(deletedDraft);
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    act(() => {
      storageRepository.clear();
      useAppStore.setState({
        hydrated: false,
        isReplying: false,
        isTaTyping: false,
        pendingUserMessages: [],
        session: createEmptySession()
      });
    });
    vi.clearAllTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("提取一次删除掉的完整片段", () => {
    expect(captureDeletedDraft("我刚才想说我很难过", "我刚才想说")).toBe("我很难过");
    expect(captureDeletedDraft("你不要走呀", "你")).toBe("不要走呀");
    expect(captureDeletedDraft("你好呀", "你好")).toBeNull();
    expect(extractDeletedDraftSegment("我其实很难过", "我其实很难")).toBe("过");
  });

  it("删除至少三个字时在停止删除后插入硬编码回复，不调用 LLM", async () => {
    act(() => {
      useAppStore.getState().updateDraft("我其实很难过", "", { isDeleting: true });
    });

    expect(useAppStore.getState().session.chatHistory).toEqual([]);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600);
    });

    const session = useAppStore.getState().session;

    expect(session.deletedDrafts).toEqual(["我其实很难过"]);
    expect(session.deletedDraftCount).toBe(1);
    expect(session.stage).toBe("draft_exposed");
    expect(session.chatHistory[session.chatHistory.length - 1]?.displayedText).toBe(getExpectedReply("我其实很难过"));
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

  it("短时间内连续逐字删除会累计为一次删稿", async () => {
    act(() => {
      useAppStore.getState().updateDraft("我其实很难过", "我其实很难", {
        isDeleting: true,
        deletionType: "deleteContentBackward",
      });
      vi.advanceTimersByTime(100);
      useAppStore.getState().updateDraft("我其实很难", "我其实很", {
        isDeleting: true,
        deletionType: "deleteContentBackward",
      });
      vi.advanceTimersByTime(100);
      useAppStore.getState().updateDraft("我其实很", "我其实", {
        isDeleting: true,
        deletionType: "deleteContentBackward",
      });
    });

    expect(useAppStore.getState().session.chatHistory).toEqual([]);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600);
    });

    const session = useAppStore.getState().session;

    expect(session.deletedDrafts).toEqual(["很难过"]);
    expect(session.deletedDraftCount).toBe(1);
    expect(session.chatHistory[session.chatHistory.length - 1]?.displayedText).toBe(getExpectedReply("很难过"));
  });
});
