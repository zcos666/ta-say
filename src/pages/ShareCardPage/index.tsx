import { useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import { useAppStore } from "../../app/store/useAppStore";
import ShareCard from "../../components/share/ShareCard";
import { shareCardComposer } from "../../features/share-card";

const pageStyles = {
  shell: {
    minHeight: "100dvh",
    padding: "clamp(16px, 4vw, 40px) clamp(14px, 4vw, 20px) calc(28px + env(safe-area-inset-bottom))",
    background:
      "radial-gradient(circle at top right, rgba(107, 44, 55, 0.09), transparent 24%), linear-gradient(180deg, rgba(20, 26, 22, 0.04), transparent 260px), #eef1ee",
    color: "#1f1f1f",
    fontFamily:
      '"Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  } satisfies CSSProperties,
  container: {
    width: "100%",
    maxWidth: "1120px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
    alignItems: "start",
    gap: "clamp(16px, 3vw, 24px)",
  } satisfies CSSProperties,
  intro: {
    display: "grid",
    gap: "20px",
    padding: "clamp(18px, 4vw, 26px)",
    borderRadius: "clamp(20px, 4vw, 28px)",
    background: "rgba(255, 255, 255, 0.84)",
    border: "1px solid rgba(214, 220, 214, 0.92)",
    boxShadow: "0 18px 44px rgba(24, 31, 24, 0.08)",
    backdropFilter: "blur(12px)",
  } satisfies CSSProperties,
  title: {
    margin: 0,
    fontSize: "clamp(32px, 7vw, 48px)",
    lineHeight: 1.05,
    letterSpacing: "-0.04em",
  } satisfies CSSProperties,
  description: {
    margin: 0,
    color: "#616961",
    fontSize: "16px",
    lineHeight: 1.7,
  } satisfies CSSProperties,
  status: {
    margin: 0,
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(107, 44, 55, 0.14)",
    background: "rgba(249, 243, 245, 0.92)",
    color: "#673340",
    fontSize: "14px",
    lineHeight: 1.6,
  } satisfies CSSProperties,
  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
  } satisfies CSSProperties,
  primaryButton: {
    border: 0,
    borderRadius: "14px",
    padding: "14px 20px",
    flex: "1 1 180px",
    background: "linear-gradient(180deg, #8b6673 0%, #714f5b 100%)",
    color: "#fffafc",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(113, 79, 91, 0.24)",
  } satisfies CSSProperties,
  secondaryButton: {
    borderRadius: "14px",
    padding: "14px 20px",
    flex: "1 1 180px",
    border: "1px solid rgba(214, 220, 214, 0.96)",
    background: "rgba(255, 255, 255, 0.96)",
    color: "#1f1f1f",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  } satisfies CSSProperties,
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  } satisfies CSSProperties,
  previewWrap: {
    display: "grid",
    justifyItems: "center",
  } satisfies CSSProperties,
} as const;

function createFileName(endingType: string) {
  const time = new Date().toISOString().slice(0, 10);
  return `过拟合恋人-share-card-${endingType}-${time}.png`;
}

export function ShareCardPage() {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [exportState, setExportState] = useState<"idle" | "exporting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const session = {
    chatHistory: useAppStore((state) => state.session.chatHistory),
    deletedDraftCount: useAppStore((state) => state.session.deletedDraftCount),
    deletedDrafts: useAppStore((state) => state.session.deletedDrafts),
    endingType: useAppStore((state) => state.session.endingType),
    hasFinishedGame: useAppStore((state) => state.session.hasFinishedGame),
    hardestSentence: useAppStore((state) => state.session.hardestSentence),
    loadCount: useAppStore((state) => state.session.loadCount),
    pollutionCount: useAppStore((state) => state.session.pollutionCount),
    shareCardData: useAppStore((state) => state.session.shareCardData),
    translatorReport: useAppStore((state) => state.session.translatorReport),
    triggeredKeywords: useAppStore((state) => state.session.triggeredKeywords),
  };

  const cardData = useMemo(() => shareCardComposer({ session }), [session]);

  const statusText = useMemo(() => {
    if (exportState === "exporting") {
      return "正在导出分享卡图片...";
    }

    if (exportState === "success") {
      return "图片已生成并开始下载。";
    }

    if (exportState === "error") {
      return errorMessage || "导出失败，请稍后重试。";
    }

    return "这是你这一轮聊天留下的结果。";
  }, [cardData.hasFinishedGame, errorMessage, exportState]);

  const handleExport = async () => {
    if (!cardRef.current) {
      setExportState("error");
      setErrorMessage("未找到可导出的卡片节点。");
      return;
    }

    try {
      setExportState("exporting");
      setErrorMessage("");

      if ("fonts" in document) {
        await document.fonts.ready;
      }

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "#f4f1f2",
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = createFileName(cardData.endingType);
      link.click();

      setExportState("success");
    } catch (error) {
      setExportState("error");
      setErrorMessage(error instanceof Error ? error.message : "导出分享卡时发生未知错误。");
    }
  };

  const buttonStyle =
    exportState === "exporting"
      ? { ...pageStyles.primaryButton, ...pageStyles.buttonDisabled }
      : pageStyles.primaryButton;

  return (
    <main style={pageStyles.shell}>
      <div style={pageStyles.container}>
        <section style={pageStyles.intro}>
          <h1 style={pageStyles.title}>你的结果卡</h1>
          <p style={pageStyles.description}>这张卡会把你这一轮聊天里最明显的反应和痕迹整理出来。</p>
          <p style={pageStyles.status}>{statusText}</p>
          <div style={pageStyles.buttonRow}>
            <button
              type="button"
              onClick={handleExport}
              disabled={exportState === "exporting"}
              style={buttonStyle}
            >
              {exportState === "exporting" ? "正在导出..." : "导出 PNG"}
            </button>
            <button
              type="button"
              onClick={() => {
                setExportState("idle");
                setErrorMessage("");
              }}
              style={pageStyles.secondaryButton}
            >
              重置状态
            </button>
            <button type="button" onClick={() => navigate("/translator")} style={pageStyles.secondaryButton}>
              继续翻译没说出口的话
            </button>
            <button type="button" onClick={() => navigate("/profiles")} style={pageStyles.secondaryButton}>
              查看关系蒸馏结果
            </button>
          </div>
        </section>

        <section style={pageStyles.previewWrap} aria-label="分享卡预览">
          <ShareCard ref={cardRef} data={cardData} />
        </section>
      </div>
    </main>
  );
}

export default ShareCardPage;
