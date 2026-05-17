import type { CSSProperties } from "react";
import type { LoveTranslationReport } from "../../types/api";
import type { ShareCardData } from "../../types/session";

export interface TranslationReportCardProps {
  report?: LoveTranslationReport;
  shareCardData?: ShareCardData;
  conversationText?: string;
  usedFallback?: boolean;
  shareLineUsedFallback?: boolean;
  notices?: string[];
}

const cardStyles: Record<string, CSSProperties> = {
  card: {
    display: "grid",
    gap: 18,
    padding: 22,
    borderRadius: 28,
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
    color: "#667066",
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
    background: "rgba(243, 245, 243, 0.96)",
    color: "#556057",
    border: "1px solid rgba(214, 220, 214, 0.96)",
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
  digestPanel: {
    display: "grid",
    gap: 14,
    padding: 18,
    borderRadius: 22,
    background: "linear-gradient(180deg, rgba(248,249,248,0.98) 0%, rgba(244,246,244,0.98) 100%)",
    border: "1px solid rgba(220, 225, 220, 0.96)",
  },
  chatFlow: {
    display: "grid",
    gap: 14,
  },
  chatRow: {
    display: "flex",
    gap: 10,
    alignItems: "flex-end",
  },
  chatRowUser: {
    justifyContent: "flex-end",
  },
  avatar: {
    width: 32,
    height: 32,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    border: "1px solid rgba(214, 220, 214, 0.96)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,246,244,0.98) 100%)",
    color: "#667066",
    fontSize: 12,
    fontWeight: 700,
  },
  bubbleWrap: {
    maxWidth: "80%",
    display: "grid",
    gap: 8,
  },
  bubbleWrapUser: {
    justifyItems: "end",
  },
  bubble: {
    padding: "12px 14px",
    borderRadius: 18,
    fontSize: 15,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    border: "1px solid rgba(214, 220, 214, 0.96)",
  },
  bubbleOther: {
    background: "#ffffff",
    color: "#1f1f1f",
    boxShadow: "0 8px 18px rgba(24, 31, 24, 0.04)",
  },
  bubbleUser: {
    background: "linear-gradient(180deg, rgba(228,241,232,0.98) 0%, rgba(219,236,224,0.98) 100%)",
    border: "1px solid rgba(47, 107, 79, 0.18)",
    color: "#234f3a",
  },
  meaningCard: {
    display: "grid",
    gap: 8,
    padding: "14px 16px",
    borderRadius: 16,
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,242,244,0.96) 100%)",
    border: "1px solid rgba(107, 44, 55, 0.12)",
    boxShadow: "0 10px 22px rgba(45, 31, 36, 0.06)",
  },
  meaningLabel: {
    margin: 0,
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#7b837b",
  },
  meaningCopy: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.7,
    color: "#1f1f1f",
    whiteSpace: "pre-wrap",
  },
  insightGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 12,
  },
  statCard: {
    padding: 14,
    borderRadius: 18,
    background: "rgba(247, 248, 247, 0.98)",
    border: "1px solid rgba(220, 225, 220, 0.96)",
  },
  statLabel: {
    margin: 0,
    fontSize: 12,
    color: "#7b837b",
  },
  statValue: {
    margin: "6px 0 0",
    fontSize: 18,
    fontWeight: 700,
    color: "#1f1f1f",
  },
  block: {
    padding: 16,
    borderRadius: 22,
    background: "rgba(247, 248, 247, 0.98)",
    border: "1px solid rgba(220, 225, 220, 0.96)",
  },
  label: {
    margin: "0 0 8px",
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#7b837b",
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
    borderRadius: 22,
    background: "linear-gradient(180deg, rgba(244,247,244,0.98) 0%, rgba(246,241,243,0.98) 100%)",
    border: "1px solid rgba(107, 44, 55, 0.12)",
  },
};

type ParsedLine = {
  id: string;
  speaker: string;
  text: string;
  isUser: boolean;
};

function normalizeLineText(value: string) {
  return value.replace(/\s+/g, "").replace(/[。！？!?,，]/g, "");
}

function parseConversation(conversationText: string | undefined, original: string): ParsedLine[] {
  const lines = (conversationText ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [
      {
        id: "single-line",
        speaker: "我",
        text: original,
        isUser: true,
      },
    ];
  }

  return lines.map((line, index) => {
    const matched = line.match(/^([^:：]{1,8})[:：]\s*(.+)$/);
    const speaker = matched?.[1]?.trim() || (index % 2 === 0 ? "TA" : "我");
    const text = matched?.[2]?.trim() || line;
    const isUser = /^(b|我|me|user|用户|自己)$/i.test(speaker) || normalizeLineText(text) === normalizeLineText(original);

    return {
      id: `${speaker}-${index}`,
      speaker,
      text,
      isUser,
    };
  });
}

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
  conversationText,
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
    "无标签拆解",
    usedFallback ? "本地翻译降级" : "",
    shareLineUsedFallback ? "分享短句降级" : "",
  ].filter(Boolean);
  const parsedConversation = parseConversation(conversationText, report.original);
  const highlightedIndex = parsedConversation.findIndex(
    (line) => normalizeLineText(line.text) === normalizeLineText(report.original),
  );
  const targetIndex = highlightedIndex >= 0 ? highlightedIndex : parsedConversation.length - 1;

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

      <section style={cardStyles.digestPanel}>
        <p style={cardStyles.label}>聊天拆解</p>
        <div style={cardStyles.chatFlow} aria-label="聊天内容与隐藏意思">
          {parsedConversation.map((line, index) => {
            const isTarget = index === targetIndex;

            return (
              <div
                key={line.id}
                style={{
                  ...cardStyles.chatRow,
                  ...(line.isUser ? cardStyles.chatRowUser : undefined),
                }}
              >
                {!line.isUser ? <span style={cardStyles.avatar}>{line.speaker.slice(0, 2)}</span> : null}

                <div
                  style={{
                    ...cardStyles.bubbleWrap,
                    ...(line.isUser ? cardStyles.bubbleWrapUser : undefined),
                  }}
                >
                  <div
                    style={{
                      ...cardStyles.bubble,
                      ...(line.isUser ? cardStyles.bubbleUser : cardStyles.bubbleOther),
                    }}
                  >
                    {line.text}
                  </div>

                  {isTarget ? (
                    <div style={cardStyles.meaningCard}>
                      <p style={cardStyles.meaningLabel}>隐藏意思</p>
                      <p style={cardStyles.meaningCopy}>{report.possibleMeaning}</p>
                      <p style={cardStyles.meaningLabel}>锋利直译</p>
                      <p style={cardStyles.meaningCopy}>{report.sharpTranslation}</p>
                    </div>
                  ) : null}
                </div>

                {line.isUser ? <span style={cardStyles.avatar}>我</span> : null}
              </div>
            );
          })}
        </div>
      </section>

      <section style={cardStyles.block}>
        <p style={cardStyles.label}>更好的说法</p>
        <p style={cardStyles.body}>{report.betterExpression}</p>
      </section>

      <section style={cardStyles.insightGrid} aria-label="翻译统计">
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
