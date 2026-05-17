import type { CSSProperties } from "react";
import type { LoveTranslationReport } from "../../types/api";

export interface TranslationReportCardProps {
  report?: LoveTranslationReport;
  targetText?: string;
  contextText?: string;
  usedFallback?: boolean;
  notices?: string[];
}

const cardStyles: Record<string, CSSProperties> = {
  card: {
    display: "grid",
    gap: 18,
    padding: "clamp(16px, 4vw, 22px)",
    borderRadius: "clamp(20px, 4vw, 28px)",
    border: "1px solid rgba(214, 220, 214, 0.96)",
    background: "rgba(255, 255, 255, 0.98)",
    color: "#1f1f1f",
    boxShadow: "0 18px 44px rgba(24, 31, 24, 0.08)",
  },
  placeholder: {
    padding: 20,
    borderRadius: 24,
    border: "1px dashed rgba(47, 107, 79, 0.24)",
    background: "rgba(247, 248, 247, 0.98)",
    color: "#667066",
  },
  header: {
    display: "grid",
    gap: 6,
  },
  title: {
    margin: 0,
    fontSize: 24,
    lineHeight: 1.2,
  },
  subtitle: {
    margin: 0,
    color: "#667066",
    fontSize: 14,
    lineHeight: 1.5,
  },
  noticeList: {
    display: "grid",
    gap: 8,
  },
  notice: {
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(107, 44, 55, 0.06)",
    color: "#673340",
    border: "1px solid rgba(107, 44, 55, 0.14)",
    fontSize: 13,
    lineHeight: 1.5,
  },
  section: {
    display: "grid",
    gap: 14,
    padding: "clamp(14px, 3vw, 18px)",
    borderRadius: "clamp(18px, 3vw, 24px)",
    background: "rgba(247, 248, 247, 0.98)",
    border: "1px solid rgba(220, 225, 220, 0.96)",
  },
  label: {
    margin: 0,
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#7b837b",
  },
  insightCard: {
    display: "grid",
    gap: 10,
    padding: "clamp(14px, 3vw, 16px)",
    borderRadius: "clamp(14px, 3vw, 16px)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,242,244,0.96) 100%)",
    border: "1px solid rgba(107, 44, 55, 0.12)",
    boxShadow: "0 10px 22px rgba(45, 31, 36, 0.06)",
  },
  insightBlock: {
    display: "grid",
    gap: 6,
  },
  insightLabel: {
    margin: 0,
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#867d81",
  },
  insightCopy: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.7,
    color: "#1f1f1f",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  block: {
    padding: "clamp(14px, 3vw, 16px)",
    borderRadius: "clamp(18px, 3vw, 22px)",
    background: "rgba(247, 248, 247, 0.98)",
    border: "1px solid rgba(220, 225, 220, 0.96)",
  },
  body: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.7,
    color: "#1f1f1f",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  highlight: {
    margin: 0,
    fontSize: 20,
    lineHeight: 1.6,
    color: "#5a2b35",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  footer: {
    padding: "clamp(14px, 3vw, 16px)",
    borderRadius: "clamp(18px, 3vw, 22px)",
    background: "linear-gradient(180deg, rgba(244,247,244,0.98) 0%, rgba(246,241,243,0.98) 100%)",
    border: "1px solid rgba(107, 44, 55, 0.12)",
  },
};

export function TranslationReportCard({
  report,
  targetText,
  contextText,
  usedFallback = false,
  notices = [],
}: TranslationReportCardProps) {
  if (!report) {
    return (
      <section style={cardStyles.placeholder} aria-live="polite">
        翻译结果会显示在这里。先填入你想翻译的那一句，再按需要补充聊天上下文。
      </section>
    );
  }

  return (
    <article style={cardStyles.card} aria-label="翻译报告卡">
      <header style={cardStyles.header}>
        <h2 style={cardStyles.title}>恋爱翻译报告</h2>
        <p style={cardStyles.subtitle}>{usedFallback ? "接口离线，已启用本地解读" : "把暧昧和拧巴翻译成人话"}</p>
      </header>

      {notices.length > 0 ? (
        <div style={cardStyles.noticeList}>
          {notices.map((notice) => (
            <div key={notice} style={cardStyles.notice}>
              {notice}
            </div>
          ))}
        </div>
      ) : null}

      <section style={cardStyles.section}>
        <p style={cardStyles.label}>你想翻译的那一句</p>
        <p style={cardStyles.body}>{targetText?.trim() || report.original}</p>
      </section>

      {contextText?.trim() ? (
        <section style={cardStyles.block}>
          <p style={cardStyles.label}>聊天上下文</p>
          <p style={cardStyles.body}>{contextText.trim()}</p>
        </section>
      ) : null}

      <section style={cardStyles.insightCard}>
        <div style={cardStyles.insightBlock}>
          <p style={cardStyles.insightLabel}>潜台词</p>
          <p style={cardStyles.insightCopy}>{report.possibleMeaning}</p>
        </div>
        <div style={cardStyles.insightBlock}>
          <p style={cardStyles.insightLabel}>锋利直译</p>
          <p style={cardStyles.insightCopy}>{report.sharpTranslation}</p>
        </div>
      </section>

      <section style={cardStyles.block}>
        <p style={cardStyles.label}>更好的说法</p>
        <p style={cardStyles.body}>{report.betterExpression}</p>
      </section>

      <section style={cardStyles.footer}>
        <p style={cardStyles.label}>行动建议</p>
        <p style={cardStyles.body}>{report.actionAdvice}</p>
      </section>
    </article>
  );
}

export default TranslationReportCard;
