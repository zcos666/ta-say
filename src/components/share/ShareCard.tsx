import { forwardRef } from "react";
import type { CSSProperties } from "react";
import type { ShareCardViewModel } from "../../features/share-card";

interface ShareCardProps {
  data: ShareCardViewModel;
}

const styles = {
  shell: {
    position: "relative",
    width: "100%",
    maxWidth: "540px",
    overflow: "hidden",
    borderRadius: "32px",
    border: "1px solid rgba(196, 184, 188, 0.86)",
    padding: "30px",
    background:
      "radial-gradient(circle at top right, rgba(107,44,55,0.09), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.995) 0%, rgba(245,243,244,0.99) 100%)",
    boxShadow: "0 24px 56px rgba(28, 24, 26, 0.16)",
    color: "#1f1f1f",
    fontFamily:
      '"Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  } satisfies CSSProperties,
  glow: {
    position: "absolute",
    inset: "1px",
    borderRadius: "31px",
    pointerEvents: "none",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.78)",
  } satisfies CSSProperties,
  noiseLine: {
    position: "absolute",
    top: "18px",
    right: "26px",
    width: "92px",
    height: "1px",
    background: "linear-gradient(90deg, rgba(107,44,55,0) 0%, rgba(107,44,55,0.46) 100%)",
  } satisfies CSSProperties,
  topRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "24px",
    position: "relative",
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
    border: "1px solid rgba(107, 44, 55, 0.16)",
    background: "rgba(249, 242, 244, 0.96)",
    color: "#6b2c37",
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
    maxWidth: "360px",
    color: "#5f6561",
    fontSize: "15px",
    lineHeight: 1.6,
  } satisfies CSSProperties,
  codeTag: {
    display: "inline-flex",
    width: "fit-content",
    marginTop: "4px",
    padding: "8px 12px",
    borderRadius: "14px",
    background: "linear-gradient(180deg, #211b1d 0%, #161214 100%)",
    color: "#f7f3f4",
    fontSize: "12px",
    letterSpacing: "0.1em",
    boxShadow: "0 10px 20px rgba(28, 22, 24, 0.18)",
  } satisfies CSSProperties,
  codeHint: {
    margin: 0,
    maxWidth: "380px",
    color: "#7f7679",
    fontSize: "12px",
    lineHeight: 1.6,
  } satisfies CSSProperties,
  sampleTag: {
    padding: "10px 12px",
    borderRadius: "16px",
    border: "1px solid rgba(107, 44, 55, 0.12)",
    color: "#6a4a52",
    background: "rgba(250, 247, 248, 0.98)",
    fontSize: "12px",
    whiteSpace: "nowrap",
  } satisfies CSSProperties,
  section: {
    display: "grid",
    gap: "12px",
    padding: "20px",
    borderRadius: "24px",
    border: "1px solid rgba(222, 222, 223, 0.96)",
    background: "rgba(252, 252, 252, 0.8)",
    boxShadow: "0 10px 24px rgba(33, 28, 31, 0.04)",
  } satisfies CSSProperties,
  sectionLabel: {
    margin: 0,
    color: "#867d81",
    fontSize: "12px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  } satisfies CSSProperties,
  ending: {
    margin: 0,
    fontSize: "34px",
    lineHeight: 1.15,
  } satisfies CSSProperties,
  typeLine: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  } satisfies CSSProperties,
  typeBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(249, 242, 244, 0.96)",
    color: "#6b2c37",
    fontSize: "13px",
    fontWeight: 600,
  } satisfies CSSProperties,
  resultName: {
    margin: "6px 0 0",
    fontSize: "24px",
    lineHeight: 1.4,
    color: "#6b2c37",
    fontWeight: 700,
  } satisfies CSSProperties,
  verdictLine: {
    margin: 0,
    fontSize: "16px",
    lineHeight: 1.7,
    color: "#2b2527",
  } satisfies CSSProperties,
  sentence: {
    margin: 0,
    fontSize: "20px",
    lineHeight: 1.6,
  } satisfies CSSProperties,
  translation: {
    margin: 0,
    fontSize: "22px",
    lineHeight: 1.6,
    color: "#5a2b35",
  } satisfies CSSProperties,
  insightGrid: {
    display: "grid",
    gap: "18px",
  } satisfies CSSProperties,
  radarWrap: {
    display: "grid",
    gap: "16px",
    justifyItems: "center",
  } satisfies CSSProperties,
  radarLegend: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px 12px",
  } satisfies CSSProperties,
  metricCard: {
    display: "grid",
    gap: "4px",
    padding: "14px",
    borderRadius: "16px",
    border: "1px solid rgba(229, 228, 230, 0.96)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(249,248,248,0.96) 100%)",
  } satisfies CSSProperties,
  metricLabel: {
    color: "#857d80",
    fontSize: "12px",
  } satisfies CSSProperties,
  metricValue: {
    fontSize: "18px",
    lineHeight: 1.2,
  } satisfies CSSProperties,
  metricDescription: {
    margin: 0,
    color: "#676260",
    fontSize: "12px",
    lineHeight: 1.6,
  } satisfies CSSProperties,
  metricInterpretation: {
    margin: 0,
    color: "#2b2527",
    fontSize: "13px",
    lineHeight: 1.6,
  } satisfies CSSProperties,
  dominantPill: {
    display: "inline-flex",
    width: "fit-content",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(107, 44, 55, 0.08)",
    color: "#6b2c37",
    fontSize: "13px",
    fontWeight: 600,
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
    borderTop: "1px solid rgba(226, 222, 224, 0.96)",
  } satisfies CSSProperties,
  footerLabel: {
    margin: 0,
    color: "#635d60",
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

function polarToPoint(cx: number, cy: number, radius: number, angleDeg: number) {
  const angle = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function buildRadarPoints(values: number[]) {
  const center = 84;
  const radius = 58;

  return values
    .map((value, index) => {
      const point = polarToPoint(center, center, (radius * value) / 100, index * 90);
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

function buildGridPath(level: number) {
  const center = 84;
  const radius = 58 * level;

  return Array.from({ length: 4 }, (_, index) => {
    const point = polarToPoint(center, center, radius, index * 90);
    return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
  }).join(" ") + " Z";
}

function RadarChart({ data }: { data: ShareCardViewModel["profileAxes"] }) {
  const polygonPoints = buildRadarPoints(data.map((axis) => axis.value));

  return (
    <svg viewBox="0 0 168 168" width="168" height="168" aria-label="关系维度图谱">
      {[0.35, 0.6, 0.85].map((level) => (
        <path
          key={level}
          d={buildGridPath(level)}
          fill="none"
          stroke="rgba(103, 92, 96, 0.16)"
          strokeWidth="1"
        />
      ))}
      {[0, 90, 180, 270].map((angle) => {
        const point = polarToPoint(84, 84, 58, angle);
        return (
          <line
            key={angle}
            x1="84"
            y1="84"
            x2={point.x}
            y2={point.y}
            stroke="rgba(103, 92, 96, 0.16)"
            strokeWidth="1"
          />
        );
      })}
      <polygon
        points={polygonPoints}
        fill="rgba(107, 44, 55, 0.12)"
        stroke="#6b2c37"
        strokeWidth="2"
      />
      {data.map((axis, index) => {
        const point = polarToPoint(84, 84, (58 * axis.value) / 100, index * 90);
        return <circle key={axis.label} cx={point.x} cy={point.y} r="3.5" fill="#6b2c37" />;
      })}
      <circle cx="84" cy="84" r="4" fill="#1f1f1f" />
    </svg>
  );
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ data }, ref) => (
  <div ref={ref} style={styles.shell}>
    <div style={styles.glow} />
    <div style={styles.noiseLine} />
    <div style={styles.topRow}>
      <div style={styles.brand}>
        <span style={styles.kicker}>RELATIONSHIP ILLUSION REPORT</span>
        <h1 style={styles.title}>{data.title}</h1>
        <p style={styles.subtitle}>{data.subtitle}</p>
      </div>
      <span style={styles.sampleTag}>{data.tagLabel}</span>
    </div>

    <section style={{ ...styles.section, marginBottom: "14px" }}>
      <p style={styles.sectionLabel}>这轮现象</p>
      <div style={styles.typeLine}>
        <h2 style={styles.ending}>{data.resultLabel}</h2>
        <span style={styles.typeBadge}>{data.fearTypeLabel}</span>
      </div>
      <p style={styles.verdictLine}>{data.verdictLine}</p>
      <p style={{ ...styles.subtitle, margin: 0 }}>{data.profileSummary}</p>
      <p style={{ ...styles.metricDescription, margin: 0 }}>触发反应：{data.endingType}</p>
    </section>

    <section style={{ ...styles.section, marginBottom: "14px" }}>
      <p style={styles.sectionLabel}>关系图谱</p>
      <div style={styles.insightGrid}>
        <div style={styles.radarWrap}>
          <RadarChart data={data.profileAxes} />
          <span style={styles.dominantPill}>主导特征：{data.dominantAxisLabel}</span>
        </div>
        <div style={styles.radarLegend}>
          {data.profileAxes.map((metric) => (
            <div key={metric.label} style={styles.metricCard}>
              <span style={styles.metricLabel}>{metric.label}</span>
              <strong style={styles.metricValue}>{metric.value}</strong>
              <p style={styles.metricDescription}>{metric.description}</p>
              <p style={styles.metricInterpretation}>{metric.interpretation}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section style={{ ...styles.section, marginBottom: "14px" }}>
      <p style={styles.sectionLabel}>这句其实在说</p>
      <p style={styles.sentence}>{data.hardestSentence}</p>
      <p style={styles.translation}>{data.translatedHighlight}</p>
    </section>

    <section style={styles.section}>
      <p style={styles.sectionLabel}>分享短句</p>
      <p style={styles.shareLine}>{data.shareLine}</p>
      <div style={styles.radarLegend}>
        {data.metrics.map((metric) => (
          <div key={metric.label} style={styles.metricCard}>
            <span style={styles.metricLabel}>{metric.label}</span>
            <strong style={styles.metricValue}>{metric.value}</strong>
          </div>
        ))}
      </div>
    </section>

    <footer style={styles.footer}>
      <p style={styles.footerLabel}>{data.footerLabel}</p>
      <p style={styles.footerMeta}>过拟合恋人 / SHARE CARD</p>
    </footer>
  </div>
));

ShareCard.displayName = "ShareCard";

export default ShareCard;
