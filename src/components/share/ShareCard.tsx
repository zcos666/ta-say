import { forwardRef } from "react";
import type { CSSProperties } from "react";
import type { ShareCardViewModel } from "../../features/share-card";

interface ShareCardProps {
  data: ShareCardViewModel;
}

const styles = {
  shell: {
    width: "100%",
    maxWidth: "540px",
    borderRadius: "28px",
    border: "1px solid rgba(255,255,255,0.14)",
    padding: "28px",
    background:
      "linear-gradient(180deg, rgba(19,19,19,0.98) 0%, rgba(8,8,8,0.98) 100%)",
    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
    color: "#f4f4f4",
    fontFamily:
      '"Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  } satisfies CSSProperties,
  topRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "24px",
  } satisfies CSSProperties,
  brand: {
    display: "grid",
    gap: "10px",
  } satisfies CSSProperties,
  kicker: {
    display: "inline-flex",
    width: "fit-content",
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#a8a8a8",
    fontSize: "12px",
    letterSpacing: "0.08em",
  } satisfies CSSProperties,
  title: {
    margin: 0,
    fontSize: "34px",
    lineHeight: 1.08,
    letterSpacing: "-0.03em",
  } satisfies CSSProperties,
  subtitle: {
    margin: 0,
    maxWidth: "320px",
    color: "#b8b8b8",
    fontSize: "15px",
    lineHeight: 1.6,
  } satisfies CSSProperties,
  sampleTag: {
    padding: "10px 12px",
    borderRadius: "16px",
    border: "1px solid rgba(255,95,95,0.3)",
    color: "#ff8a8a",
    background: "rgba(255,95,95,0.08)",
    fontSize: "12px",
    whiteSpace: "nowrap",
  } satisfies CSSProperties,
  section: {
    display: "grid",
    gap: "12px",
    padding: "18px",
    borderRadius: "22px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.03)",
  } satisfies CSSProperties,
  sectionLabel: {
    margin: 0,
    color: "#8e8e8e",
    fontSize: "12px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  } satisfies CSSProperties,
  ending: {
    margin: 0,
    fontSize: "30px",
    lineHeight: 1.15,
  } satisfies CSSProperties,
  sentence: {
    margin: 0,
    fontSize: "20px",
    lineHeight: 1.5,
  } satisfies CSSProperties,
  translation: {
    margin: 0,
    fontSize: "22px",
    lineHeight: 1.6,
    color: "#f7d4d4",
  } satisfies CSSProperties,
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
  } satisfies CSSProperties,
  metricCard: {
    display: "grid",
    gap: "6px",
    padding: "16px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.02)",
  } satisfies CSSProperties,
  metricLabel: {
    color: "#8e8e8e",
    fontSize: "12px",
  } satisfies CSSProperties,
  metricValue: {
    fontSize: "22px",
    lineHeight: 1.2,
  } satisfies CSSProperties,
  shareLine: {
    margin: 0,
    fontSize: "17px",
    lineHeight: 1.75,
  } satisfies CSSProperties,
  footer: {
    display: "grid",
    gap: "8px",
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  } satisfies CSSProperties,
  footerLabel: {
    margin: 0,
    color: "#9c9c9c",
    fontSize: "13px",
    lineHeight: 1.6,
  } satisfies CSSProperties,
  footerMeta: {
    margin: 0,
    color: "#f0f0f0",
    fontSize: "14px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  } satisfies CSSProperties,
} as const;

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ data }, ref) => (
  <div ref={ref} style={styles.shell}>
    <div style={styles.topRow}>
      <div style={styles.brand}>
        <span style={styles.kicker}>RELATIONSHIP ILLUSION REPORT</span>
        <h1 style={styles.title}>{data.title}</h1>
        <p style={styles.subtitle}>{data.subtitle}</p>
      </div>
      <span style={styles.sampleTag}>{data.tagLabel}</span>
    </div>

    <section style={{ ...styles.section, marginBottom: "14px" }}>
      <p style={styles.sectionLabel}>你的结局</p>
      <h2 style={styles.ending}>{data.endingType}</h2>
      <p style={{ ...styles.subtitle, margin: 0 }}>关系幻觉类型：{data.fearTypeLabel}</p>
    </section>

    <section style={{ ...styles.section, marginBottom: "14px" }}>
      <p style={styles.sectionLabel}>最大嘴硬句</p>
      <p style={styles.sentence}>{data.hardestSentence}</p>
    </section>

    <section style={{ ...styles.section, marginBottom: "14px" }}>
      <p style={styles.sectionLabel}>AI 翻译</p>
      <p style={styles.translation}>{data.translatedHighlight}</p>
    </section>

    <section style={{ ...styles.section, marginBottom: "14px" }}>
      <p style={styles.sectionLabel}>本轮记录</p>
      <div style={styles.metricsGrid}>
        {data.metrics.map((metric) => (
          <div key={metric.label} style={styles.metricCard}>
            <span style={styles.metricLabel}>{metric.label}</span>
            <strong style={styles.metricValue}>{metric.value}</strong>
          </div>
        ))}
      </div>
    </section>

    <section style={styles.section}>
      <p style={styles.sectionLabel}>最后一句</p>
      <p style={styles.shareLine}>{data.shareLine}</p>
    </section>

    <footer style={styles.footer}>
      <p style={styles.footerLabel}>{data.footerLabel}</p>
      <p style={styles.footerMeta}>TA SAY / SHARE CARD</p>
    </footer>
  </div>
));

ShareCard.displayName = "ShareCard";

export default ShareCard;
