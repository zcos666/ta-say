import type { CSSProperties } from "react";
import type { LoveTranslationReport } from "../../types/api";
import type { ShareCardData } from "../../types/session";

export interface TranslationReportCardProps {
  report?: LoveTranslationReport;
  shareCardData?: ShareCardData;
  usedFallback?: boolean;
  shareLineUsedFallback?: boolean;
  notices?: string[];
}

const cardStyles: Record<string, CSSProperties> = {
  card: {
    display: "grid",
    gap: 16,
    padding: 20,
    borderRadius: 20,
    border: "1px solid rgba(215, 223, 214, 0.96)",
    background: "rgba(255, 255, 255, 0.98)",
    color: "#1f1f1f",
    boxShadow: "0 14px 36px rgba(31, 31, 31, 0.08)",
  },
  placeholder: {
    padding: 20,
    borderRadius: 20,
    border: "1px dashed rgba(149, 236, 105, 0.46)",
    background: "rgba(231, 248, 221, 0.48)",
    color: "#5f6660",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },
  titleBlock: {
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
    color: "#5f6660",
    fontSize: 14,
    lineHeight: 1.5,
  },
  badges: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    background: "rgba(231, 248, 221, 0.96)",
    color: "#356d22",
    border: "1px solid rgba(149, 236, 105, 0.4)",
  },
  noticeList: {
    display: "grid",
    gap: 8,
  },
  notice: {
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(231, 248, 221, 0.94)",
    color: "#356d22",
    fontSize: 13,
    lineHeight: 1.5,
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 12,
  },
  statCard: {
    padding: 14,
    borderRadius: 16,
    background: "rgba(246, 248, 246, 0.98)",
    border: "1px solid rgba(215, 223, 214, 0.96)",
  },
  statLabel: {
    margin: 0,
    fontSize: 12,
    color: "#868f86",
  },
  statValue: {
    margin: "6px 0 0",
    fontSize: 18,
    fontWeight: 700,
    color: "#1f1f1f",
  },
  block: {
    padding: 16,
    borderRadius: 18,
    background: "rgba(246, 248, 246, 0.98)",
    border: "1px solid rgba(215, 223, 214, 0.96)",
  },
  label: {
    margin: "0 0 8px",
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#868f86",
  },
  highlight: {
    margin: 0,
    fontSize: 20,
    lineHeight: 1.6,
    color: "#1f1f1f",
    whiteSpace: "pre-wrap",
  },
  body: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.7,
    color: "#1f1f1f",
    whiteSpace: "pre-wrap",
  },
  footer: {
    padding: 16,
    borderRadius: 18,
    background: "rgba(231, 248, 221, 0.94)",
    border: "1px solid rgba(149, 236, 105, 0.34)",
  },
};

function renderBadge(label: string) {
  return (
    <span key={label} style={cardStyles.badge}>
      {label}
    </span>
  );
}

export function TranslationReportCard({
  report,
  shareCardData,
  usedFallback = false,
  shareLineUsedFallback = false,
  notices = [],
}: TranslationReportCardProps) {
  if (!report || !shareCardData) {
    return (
      <section style={cardStyles.placeholder} aria-live="polite">
        翻译结果会显示在这里。提交一段对话后，可查看情绪解读、直译版本和分享摘要。
      </section>
    );
  }

  const badges = [
    shareCardData.endingType,
    shareCardData.fearType ?? "未选择恐惧标签",
    usedFallback ? "本地翻译降级" : "",
    shareLineUsedFallback ? "分享短句降级" : "",
  ].filter(Boolean);

  return (
    <article style={cardStyles.card} aria-label="翻译报告卡">
      <header style={cardStyles.header}>
        <div style={cardStyles.titleBlock}>
          <h2 style={cardStyles.title}>恋爱翻译报告</h2>
          <p style={cardStyles.subtitle}>
            {usedFallback ? "接口离线，已启用本地解读" : "把暧昧和拧巴翻译成人话"}
          </p>
        </div>
        <div style={cardStyles.badges}>{badges.map((label) => renderBadge(String(label)))}</div>
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

      <section style={cardStyles.statGrid} aria-label="翻译统计">
        <div style={cardStyles.statCard}>
          <p style={cardStyles.statLabel}>最难说出口</p>
          <p style={cardStyles.statValue}>{shareCardData.hardestSentence}</p>
        </div>
        <div style={cardStyles.statCard}>
          <p style={cardStyles.statLabel}>污染次数</p>
          <p style={cardStyles.statValue}>{shareCardData.pollutionCount}</p>
        </div>
        <div style={cardStyles.statCard}>
          <p style={cardStyles.statLabel}>删除草稿</p>
          <p style={cardStyles.statValue}>{shareCardData.deletedDraftCount}</p>
        </div>
        <div style={cardStyles.statCard}>
          <p style={cardStyles.statLabel}>读档次数</p>
          <p style={cardStyles.statValue}>{shareCardData.loadCount}</p>
        </div>
      </section>

      <section style={cardStyles.block}>
        <p style={cardStyles.label}>原句</p>
        <p style={cardStyles.highlight}>{report.original}</p>
      </section>

      <section style={cardStyles.block}>
        <p style={cardStyles.label}>潜台词</p>
        <p style={cardStyles.body}>{report.possibleMeaning}</p>
      </section>

      <section style={cardStyles.block}>
        <p style={cardStyles.label}>锋利直译</p>
        <p style={cardStyles.body}>{report.sharpTranslation}</p>
      </section>

      <section style={cardStyles.block}>
        <p style={cardStyles.label}>更好的说法</p>
        <p style={cardStyles.body}>{report.betterExpression}</p>
      </section>

      <section style={cardStyles.footer}>
        <p style={cardStyles.label}>行动建议</p>
        <p style={cardStyles.body}>{report.actionAdvice}</p>
        <p style={{ ...cardStyles.label, marginTop: 12 }}>分享短句</p>
        <p style={cardStyles.body}>{shareCardData.shareLine}</p>
      </section>
    </article>
  );
}

export default TranslationReportCard;
