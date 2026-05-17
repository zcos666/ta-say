import type { CSSProperties } from "react";
import type { RelationshipAnalysisReport } from "../../types/api";

export interface TranslationReportCardProps {
  report?: RelationshipAnalysisReport;
  conversationText?: string;
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
  list: {
    margin: 0,
    paddingLeft: 18,
    display: "grid",
    gap: 8,
    color: "#1f1f1f",
    fontSize: 14,
    lineHeight: 1.7,
  },
  keyMomentCard: {
    display: "grid",
    gap: 8,
    padding: "clamp(14px, 3vw, 16px)",
    borderRadius: "clamp(16px, 3vw, 18px)",
    background: "rgba(255,255,255,0.98)",
    border: "1px solid rgba(107, 44, 55, 0.12)",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 18,
    lineHeight: 1.4,
    color: "#2c2326",
  },
  statsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  statChip: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 30,
    padding: "0 12px",
    borderRadius: 999,
    background: "rgba(247, 242, 244, 0.96)",
    border: "1px solid rgba(107, 44, 55, 0.1)",
    color: "#6a545b",
    fontSize: 12,
  },
};

export function TranslationReportCard({
  report,
  conversationText,
  usedFallback = false,
  notices = [],
}: TranslationReportCardProps) {
  if (!report) {
    return (
      <section style={cardStyles.placeholder} aria-live="polite">
        分析报告会显示在这里。先粘贴一段聊天记录，系统会从整体关系而不是单句出发来整理这段对话。
      </section>
    );
  }

  return (
    <article style={cardStyles.card} aria-label="翻译报告卡">
      <header style={cardStyles.header}>
        <h2 style={cardStyles.title}>关系分析报告</h2>
        <p style={cardStyles.subtitle}>{usedFallback ? "接口离线，已启用本地分析" : "从整段聊天里看你们是怎么错位的"}</p>
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
        <p style={cardStyles.label}>关系概览</p>
        <h3 style={cardStyles.sectionTitle}>先看结论</h3>
        <p style={cardStyles.highlight}>{report.summary}</p>
        <p style={cardStyles.body}>{report.relationshipState}</p>
        <div style={cardStyles.statsRow}>
          <span style={cardStyles.statChip}>关键片段 {report.keyMoments.length}</span>
          <span style={cardStyles.statChip}>主要问题 {report.mainIssues.length}</span>
          <span style={cardStyles.statChip}>沟通建议 {report.communicationAdvice.doMore.length + report.communicationAdvice.avoid.length}</span>
        </div>
      </section>

      {conversationText?.trim() ? (
        <section style={cardStyles.block}>
          <p style={cardStyles.label}>聊天记录</p>
          <p style={cardStyles.body}>{conversationText.trim()}</p>
        </section>
      ) : null}

      <section style={cardStyles.insightCard}>
        <h3 style={cardStyles.sectionTitle}>再看双方怎么聊天</h3>
        <div style={cardStyles.insightBlock}>
          <p style={cardStyles.insightLabel}>你是怎么聊天的</p>
          <p style={cardStyles.insightCopy}>{report.selfProfile.summary}</p>
          <ul style={cardStyles.list}>
            {report.selfProfile.traits.map((trait) => (
              <li key={trait}>{trait}</li>
            ))}
          </ul>
        </div>
        <div style={cardStyles.insightBlock}>
          <p style={cardStyles.insightLabel}>对方是怎么聊天的</p>
          <p style={cardStyles.insightCopy}>{report.otherProfile.summary}</p>
          <ul style={cardStyles.list}>
            {report.otherProfile.traits.map((trait) => (
              <li key={trait}>{trait}</li>
            ))}
          </ul>
        </div>
      </section>

      <section style={cardStyles.block}>
        <p style={cardStyles.label}>你们为什么容易错位</p>
        <h3 style={cardStyles.sectionTitle}>关系是怎么卡住的</h3>
        <ul style={cardStyles.list}>
          {report.interactionPattern.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section style={cardStyles.section}>
        <p style={cardStyles.label}>关键片段</p>
        <h3 style={cardStyles.sectionTitle}>哪些话最关键</h3>
        {report.keyMoments.map((moment) => (
          <div key={`${moment.title}-${moment.quote}`} style={cardStyles.keyMomentCard}>
            <p style={cardStyles.insightLabel}>{moment.title}</p>
            <p style={cardStyles.body}>{moment.quote}</p>
            <p style={cardStyles.insightCopy}>{moment.insight}</p>
          </div>
        ))}
      </section>

      <section style={cardStyles.block}>
        <p style={cardStyles.label}>当前主要问题</p>
        <h3 style={cardStyles.sectionTitle}>现在最值得注意的点</h3>
        <ul style={cardStyles.list}>
          {report.mainIssues.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section style={cardStyles.footer}>
        <p style={cardStyles.label}>沟通方向</p>
        <h3 style={cardStyles.sectionTitle}>接下来更适合怎么做</h3>
        <p style={cardStyles.highlight}>{report.communicationAdvice.direction}</p>
        <p style={cardStyles.insightLabel}>建议多做</p>
        <ul style={cardStyles.list}>
          {report.communicationAdvice.doMore.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p style={cardStyles.insightLabel}>建议避免</p>
        <ul style={cardStyles.list}>
          {report.communicationAdvice.avoid.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p style={cardStyles.insightLabel}>下一步</p>
        <p style={cardStyles.body}>{report.communicationAdvice.nextStep}</p>
      </section>
    </article>
  );
}

export default TranslationReportCard;
