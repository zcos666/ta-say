import { useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { toPng } from "html-to-image";
import { useAppStore } from "../../app/store/useAppStore";
import ShareCard from "../../components/share/ShareCard";
import { shareCardComposer } from "../../features/share-card";

const pageStyles = {
  shell: {
    minHeight: "100vh",
    padding: "40px 20px 56px",
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
    gridTemplateColumns: "minmax(0, 320px) minmax(0, 540px)",
    justifyContent: "space-between",
    alignItems: "start",
    gap: "32px",
  } satisfies CSSProperties,
  intro: {
    display: "grid",
    gap: "20px",
    padding: "26px 24px 24px",
    borderRadius: "28px",
    background: "rgba(255, 255, 255, 0.84)",
    border: "1px solid rgba(214, 220, 214, 0.92)",
    boxShadow: "0 18px 44px rgba(24, 31, 24, 0.08)",
    backdropFilter: "blur(12px)",
  } satisfies CSSProperties,
  eyebrowRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  } satisfies CSSProperties,
  eyebrow: {
    margin: 0,
    display: "inline-flex",
    width: "fit-content",
    padding: "6px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(30, 37, 33, 0.08)",
    background: "rgba(241, 243, 241, 0.96)",
    color: "#39423c",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontSize: "12px",
  } satisfies CSSProperties,
  dangerTag: {
    display: "inline-flex",
    width: "fit-content",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "rgba(107, 44, 55, 0.08)",
    border: "1px solid rgba(107, 44, 55, 0.16)",
    color: "#673340",
    letterSpacing: "0.04em",
    fontSize: "12px",
  } satisfies CSSProperties,
  title: {
    margin: 0,
    fontSize: "48px",
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
    background: "linear-gradient(180deg, #262123 0%, #181517 100%)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(28, 22, 24, 0.18)",
  } satisfies CSSProperties,
  secondaryButton: {
    borderRadius: "14px",
    padding: "14px 20px",
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
  noteList: {
    margin: 0,
    paddingLeft: "18px",
    color: "#616961",
    lineHeight: 1.8,
  } satisfies CSSProperties,
  warning: {
    padding: "12px 14px",
    borderRadius: "16px",
    background: "linear-gradient(180deg, rgba(255,248,250,0.96) 0%, rgba(247,242,244,0.96) 100%)",
    border: "1px solid rgba(107, 44, 55, 0.14)",
    color: "#5f4b50",
    fontSize: "13px",
    lineHeight: 1.7,
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [exportState, setExportState] = useState<"idle" | "exporting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const session = {
    chatHistory: useAppStore((state) => state.session.chatHistory),
    deletedDraftCount: useAppStore((state) => state.session.deletedDraftCount),
    deletedDrafts: useAppStore((state) => state.session.deletedDrafts),
    endingType: useAppStore((state) => state.session.endingType),
    fearType: useAppStore((state) => state.session.fearType),
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

    return cardData.hasFinishedGame
      ? "当前展示的是完整通关报告，可直接导出传播。"
      : "当前为进行中报告，继续体验后可获得更完整的分享卡。";
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
          <div style={pageStyles.eyebrowRow}>
            <p style={pageStyles.eyebrow}>Share Card Export</p>
            <span style={pageStyles.dangerTag}>异常样本归档</span>
          </div>
          <h1 style={pageStyles.title}>把这张关系幻觉报告带走。</h1>
          <p style={pageStyles.description}>
            这不是一张热闹的战报图，而是一份漂亮的关系档案。页面会把当前会话、翻译结果和 fallback
            信息整理成同一份可导出的异常记录。
          </p>
          <div style={pageStyles.warning}>
            导出建议：这张卡最适合看起来很克制的分享场景。第一眼应该优雅，第二眼才让人觉得不对劲。
          </div>
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
          </div>
          <ul style={pageStyles.noteList}>
            <li>展示字段包含结局名、最大嘴硬句、AI 翻译、统计数据与最后一句话。</li>
            <li>若缺少分享卡缓存或接口返回，页面会使用本地规则自动补齐内容。</li>
            <li>导出基于 `html-to-image` 生成 PNG，适合继续接入页面路由或完整流程联调。</li>
          </ul>
        </section>

        <section style={pageStyles.previewWrap} aria-label="分享卡预览">
          <ShareCard ref={cardRef} data={cardData} />
        </section>
      </div>
    </main>
  );
}

export default ShareCardPage;
