import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, afterEach } from "vitest";
import ShareCardPage from "../src/pages/ShareCardPage";
import { useSessionStore } from "../src/app/store/sessionStore";

const toPngMock = vi.fn().mockResolvedValue("data:image/png;base64,mock");

vi.mock("html-to-image", () => ({
  toPng: (...args: unknown[]) => toPngMock(...args),
}));

describe("ShareCardPage", () => {
  afterEach(() => {
    useSessionStore.getState().resetSession();
    toPngMock.mockClear();
  });

  it("可以导出 PNG 分享卡", async () => {
    useSessionStore.getState().patchSession({
      hasFinishedGame: true,
      endingType: "梦醒翻译家",
      hardestSentence: "没事，你忙吧。",
      fearType: "害怕说真话",
      translatorReport: {
        original: "没事，你忙吧。",
        possibleMeaning: "我其实很在意。",
        sharpTranslation: "我想被你认真安抚。",
        betterExpression: "我其实有点失落。",
        actionAdvice: "把需求说具体。",
      },
      shareCardData: {
        endingType: "梦醒翻译家",
        hardestSentence: "没事，你忙吧。",
        shareLine: "通关之后，你终于肯把情绪翻译成人话。",
        fearType: "害怕说真话",
        pollutionCount: 2,
        deletedDraftCount: 1,
        loadCount: 0,
        aiTranslation: "我想被你认真安抚。",
      },
    });

    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: Promise.resolve() },
    });

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const user = userEvent.setup();

    render(<ShareCardPage />);

    await user.click(screen.getByRole("button", { name: "导出 PNG" }));
    await screen.findByText("图片已生成并开始下载。");

    await waitFor(() => {
      expect(toPngMock).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    clickSpy.mockRestore();
  });
});
