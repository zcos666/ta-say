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
    border: "1px solid rgba(146, 118, 127, 0.5)",
    padding: "30px",
    background:
      "radial-gradient(circle at 12% 0%, rgba(107,44,55,0.14), transparent 26%), radial-gradient(circle at 100% 100%, rgba(18,14,17,0.1), transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.995) 0%, rgba(241,236,239,0.99) 100%)",
    boxShadow: "0 28px 64px rgba(28, 24, 26, 0.22)",
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
  scanLayer: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    opacity: 0.26,
    background:
      "repeating-linear-gradient(180deg, rgba(255,255,255,0) 0 10px, rgba(107,44,55,0.04) 10px 11px, rgba(255,255,255,0) 11px 22px)",
    mixBlendMode: "multiply",
  } satisfies CSSProperties,
  seal: {
    position: "absolute",
    top: "84px",
    right: "-36px",
    padding: "9px 38px",
    transform: "rotate(16deg)",
    borderTop: "1px solid rgba(107, 44, 55, 0.22)",
    borderBottom: "1px solid rgba(107, 44, 55, 0.22)",
    background: "rgba(107, 44, 55, 0.06)",
    color: "rgba(107, 44, 55, 0.72)",
    fontSize: "11px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
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
    border: "1px solid rgba(203, 194, 198, 0.72)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.84) 0%, rgba(249,246,247,0.8) 100%)",
    boxShadow: "0 12px 28px rgba(33, 28, 31, 0.06)",
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
    color: "#fff6f8",
  } satisfies CSSProperties,
  contextBlock: {
    display: "grid",
    gap: "8px",
    padding: "14px 16px",
    borderRadius: "18px",
    background: "rgba(255, 255, 255, 0.78)",
    border: "1px solid rgba(229, 228, 230, 0.96)",
  } satisfies CSSProperties,
  evidenceStack: {
    display: "grid",
    gap: "12px",
  } satisfies CSSProperties,
  contextMetaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    flexWrap: "wrap",
  } satisfies CSSProperties,
  dreamContextBlock: {
    background:
      "linear-gradient(180deg, rgba(255,248,250,0.96) 0%, rgba(249,240,243,0.92) 100%)",
    border: "1px solid rgba(107, 44, 55, 0.16)",
    boxShadow: "0 12px 28px rgba(107, 44, 55, 0.08)",
  } satisfies CSSProperties,
  translatorContextBlock: {
    background:
      "linear-gradient(180deg, rgba(248,249,251,0.96) 0%, rgba(241,242,245,0.92) 100%)",
    border: "1px solid rgba(62, 66, 76, 0.12)",
  } satisfies CSSProperties,
  memoryChip: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "24px",
    padding: "0 10px",
    borderRadius: "999px",
    background: "rgba(107, 44, 55, 0.1)",
    color: "#6b2c37",
    fontSize: "11px",
    letterSpacing: "0.08em",
  } satisfies CSSProperties,
  translatorChip: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "24px",
    padding: "0 10px",
    borderRadius: "999px",
    background: "rgba(33, 37, 45, 0.08)",
    color: "#424852",
    fontSize: "11px",
    letterSpacing: "0.08em",
  } satisfies CSSProperties,
  contextLabel: {
    margin: 0,
    color: "#857d80",
    fontSize: "11px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  } satisfies CSSProperties,
  contextCopy: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#2b2527",
    whiteSpace: "pre-wrap",
  } satisfies CSSProperties,
  translationPanel: {
    display: "grid",
    gap: "10px",
    padding: "16px 18px",
    borderRadius: "20px",
    background:
      "linear-gradient(180deg, rgba(31,24,27,0.98) 0%, rgba(48,34,39,0.96) 100%)",
    boxShadow: "0 18px 36px rgba(31, 24, 27, 0.18)",
  } satisfies CSSProperties,
  translation: {
    margin: 0,
    fontSize: "22px",
    lineHeight: 1.6,
    color: "#f6dfe6",
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
  radarSvgWrap: {
    position: "relative",
    width: "168px",
    height: "168px",
  } satisfies CSSProperties,
  axisLabel: {
    position: "absolute",
    fontSize: "12px",
    lineHeight: 1.4,
    color: "#857d80",
    whiteSpace: "nowrap",
  } satisfies CSSProperties,
  axisTop: {
    top: "-18px",
    left: "50%",
    transform: "translateX(-50%)",
  } satisfies CSSProperties,
  axisRight: {
    top: "50%",
    right: "-40px",
    transform: "translateY(-50%)",
  } satisfies CSSProperties,
  axisBottom: {
    bottom: "-18px",
    left: "50%",
    transform: "translateX(-50%)",
  } satisfies CSSProperties,
  axisLeft: {
    top: "50%",
    left: "-40px",
    transform: "translateY(-50%)",
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
  const axisPositions = [styles.axisTop, styles.axisRight, styles.axisBottom, styles.axisLeft];

  return (
    <div style={styles.radarSvgWrap}>
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
      {data.map((axis, index) => (
        <span key={`${axis.label}-label`} style={{ ...styles.axisLabel, ...axisPositions[index] }}>
          {axis.label}
        </span>
      ))}
    </div>
  );
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ data }, ref) => (
  <div ref={ref} style={styles.shell}>
    <div style={styles.glow} />
    <div style={styles.noiseLine} />
    <div style={styles.scanLayer} />
    <div style={styles.seal}>ABNORMAL ARCHIVE</div>
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
        <span style={styles.typeBadge}>{data.profileTag}</span>
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
      <p style={styles.sectionLabel}>留下来的证据</p>
      <div style={styles.evidenceStack}>
        <div style={{ ...styles.contextBlock, ...styles.dreamContextBlock }}>
          <div style={styles.contextMetaRow}>
            <p style={styles.contextLabel}>梦里主线聊天摘录</p>
            <span style={styles.memoryChip}>DREAM LOG</span>
          </div>
          <p style={styles.contextCopy}>{data.dreamConversationPreview}</p>
        </div>
        <div style={{ ...styles.contextBlock, ...styles.dreamContextBlock }}>
          <div style={styles.contextMetaRow}>
            <p style={styles.contextLabel}>最后卡住你的那一句</p>
            <span style={styles.memoryChip}>LOCKED LINE</span>
          </div>
          <p style={styles.contextCopy}>{data.dreamReferenceText}</p>
        </div>
        {data.translatorContextText ? (
          <div style={{ ...styles.contextBlock, ...styles.translatorContextBlock }}>
            <div style={styles.contextMetaRow}>
              <p style={styles.contextLabel}>后来补进来的聊天</p>
              <span style={styles.translatorChip}>LATE EVIDENCE</span>
            </div>
            <p style={styles.contextCopy}>{data.translatorContextText}</p>
          </div>
        ) : null}
      </div>
      <div style={styles.translationPanel}>
        <p style={styles.sentence}>{data.hardestSentence}</p>
        <p style={styles.translation}>{data.translatedHighlight}</p>
      </div>
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
