import { useEffect, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/store/useAppStore";

const locationImageUrl = new URL("../../../c57832db96fa00de7e7da50eb070bd31.png", import.meta.url).href;

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background: "radial-gradient(circle at top, rgba(149, 236, 105, 0.12), transparent 35%), #090909",
    color: "#f4f4f4",
  },
  shell: {
    width: "min(100%, 980px)",
    display: "grid",
    gap: 20,
  },
  title: {
    margin: 0,
    fontSize: "clamp(28px, 4vw, 44px)",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    margin: 0,
    color: "rgba(244, 244, 244, 0.74)",
    lineHeight: 1.7,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.35)",
  },
  locationFrame: {
    position: "relative",
    minHeight: 520,
    overflow: "hidden",
    borderRadius: 28,
    background: "linear-gradient(180deg, rgba(12, 12, 12, 0.06), rgba(12, 12, 12, 0.22))",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.35)",
  },
  locationImage: {
    display: "block",
    width: "100%",
    height: "100%",
    minHeight: 520,
    objectFit: "cover",
  },
  imageShade: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(14, 14, 18, 0.14))",
    pointerEvents: "none",
  },
  bottomPanel: {
    display: "grid",
    gap: 8,
    marginTop: 16,
    display: "grid",
    padding: 16,
    borderRadius: 18,
    background: "rgba(5, 5, 5, 0.52)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  bottomTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
  },
  bottomCopy: {
    margin: 0,
    color: "rgba(244, 244, 244, 0.72)",
    lineHeight: 1.7,
  },
  buttonRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  button: {
    padding: "12px 18px",
    borderRadius: 999,
    border: "1px solid rgba(255, 255, 255, 0.14)",
    background: "#95ec69",
    color: "#17320b",
    fontWeight: 700,
  },
  ghostButton: {
    padding: "12px 18px",
    borderRadius: 999,
    border: "1px solid rgba(255, 255, 255, 0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#f4f4f4",
    fontWeight: 600,
  },
};

export function LocationPage() {
  const navigate = useNavigate();
  const session = useAppStore((state) => state.session);
  const completeLocationReveal = useAppStore((state) => state.completeLocationReveal);

  useEffect(() => {
    if (session.stage !== "location_reveal") {
      navigate("/chat", { replace: true });
    }
  }, [navigate, session.stage]);

  return (
    <main style={styles.page}>
      <section style={styles.shell}>
        <div style={styles.card}>
          <h1 style={styles.title}>你在哪？</h1>
          <p style={styles.subtitle}>
            这是 TA 直接发来的定位截图。现在会直接读取你放进项目里的真实图片，而不是之前那张占位视觉稿。
          </p>
        </div>

        <section style={styles.locationFrame} aria-label="定位图">
          <img src={locationImageUrl} alt="TA 发来的定位截图" style={styles.locationImage} />
          <div style={styles.imageShade} />
        </section>
        <div style={styles.bottomPanel}>
          <p style={styles.bottomTitle}>距离：0.00 km</p>
          <p style={styles.bottomCopy}>
            这次展示的是你提供的真实定位截图。你和 TA 的位置已经几乎贴在一起了。
          </p>
          <div style={styles.buttonRow}>
            <button
              type="button"
              style={styles.button}
              onClick={() => {
                completeLocationReveal();
                navigate("/chat");
              }}
            >
              退出查看
            </button>
            <button
              type="button"
              style={styles.ghostButton}
              onClick={() => {
                completeLocationReveal();
                navigate("/chat");
              }}
            >
              先离开这里
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
