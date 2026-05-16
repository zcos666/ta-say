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
    borderRadius: "24px",
    border: "1px solid rgba(215, 223, 214, 0.96)",
    padding: "28px",
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,248,246,0.98) 100%)",
    boxShadow: "0 16px 40px rgba(31, 31, 31, 0.12)",
    color: "#1f1f1f",
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
    border: "1px solid rgba(149, 236, 105, 0.4)",
    background: "rgba(231, 248, 221, 0.96)",
    color: "#4f9f33",
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
    color: "#5f6660",
    fontSize: "15px",
    lineHeight: 1.6,
  } satisfies CSSProperties,
  sampleTag: {
    padding: "10px 12px",
    borderRadius: "16px",
    border: "1px solid rgba(149, 236, 105, 0.4)",
    color: "#356d22",
    background: "rgba(231, 248, 221, 0.96)",
    fontSize: "12px",
    whiteSpace: "nowrap",
  } satisfies CSSProperties,
  section: {
    display: "grid",
    gap: "12px",
    padding: "18px",
    borderRadius: "22px",
    border: "1px solid rgba(215, 223, 214, 0.96)",
    background: "rgba(246, 248, 246, 0.98)",
  } satisfies CSSProperties,
  sectionLabel: {
    margin: 0,
    color: "#868f86",
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
    color: "#356d22",
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
    border: "1px solid rgba(215, 223, 214, 0.96)",
    background: "#ffffff",
  } satisfies CSSProperties,
  metricLabel: {
    color: "#868f86",
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
    borderTop: "1px solid rgba(215, 223, 214, 0.96)",
  } satisfies CSSProperties,
  footerLabel: {
    margin: 0,
    color: "#5f6660",
    fontSize: "13px",
    lineHeight: 1.6,
  } satisfies CSSProperties,
  footerMeta: {
    margin: 0,
    color: "#1f1f1f",
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
      <p style={styles.footerMeta}>过拟合恋人 / SHARE CARD</p>
    </footer>
  </div>
));

ShareCard.displayName = "ShareCard";

export default ShareCard;
