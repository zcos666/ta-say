import { useEffect, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/store/useAppStore";

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
    background:
      'linear-gradient(180deg, rgba(18, 18, 18, 0.28), rgba(18, 18, 18, 0.82)), url("/images/location/final-location-map.png"), linear-gradient(135deg, #222 0%, #101010 100%)',
    backgroundPosition: "center",
    backgroundSize: "cover",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  mapGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    opacity: 0.45,
  },
  roadA: {
    position: "absolute",
    left: "12%",
    top: "8%",
    width: "76%",
    height: 16,
    borderRadius: 999,
    transform: "rotate(-26deg)",
    background: "rgba(244, 244, 244, 0.22)",
  },
  roadB: {
    position: "absolute",
    left: "8%",
    top: "62%",
    width: "80%",
    height: 18,
    borderRadius: 999,
    transform: "rotate(12deg)",
    background: "rgba(244, 244, 244, 0.16)",
  },
  roadC: {
    position: "absolute",
    left: "52%",
    top: "18%",
    width: 18,
    height: "60%",
    borderRadius: 999,
    background: "rgba(244, 244, 244, 0.14)",
  },
  markerSelf: {
    position: "absolute",
    left: "51%",
    top: "48%",
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "#95ec69",
    boxShadow: "0 0 0 10px rgba(149, 236, 105, 0.2)",
  },
  markerTa: {
    position: "absolute",
    left: "53%",
    top: "50%",
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "#ff6b6b",
    boxShadow: "0 0 0 12px rgba(255, 107, 107, 0.18)",
  },
  uiPanel: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "rgba(244, 244, 244, 0.78)",
    fontSize: 13,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  bottomPanel: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 18,
    display: "grid",
    gap: 8,
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
            这是 TA 直接发来的定位图。默认会读取 `/images/location/final-location-map.png`；如果你还没放图片，就先显示当前这张内置视觉稿。
          </p>
        </div>

        <section style={styles.locationFrame} aria-label="定位图">
          <div style={styles.mapGrid} />
          <div style={styles.roadA} />
          <div style={styles.roadB} />
          <div style={styles.roadC} />
          <div style={styles.markerSelf} aria-hidden="true" />
          <div style={styles.markerTa} aria-hidden="true" />

          <div style={styles.uiPanel}>
            <span>定位共享</span>
            <span>已同步完成</span>
          </div>

          <div style={styles.bottomPanel}>
            <p style={styles.bottomTitle}>距离：0.01 km</p>
            <p style={styles.bottomCopy}>
              你和 TA 的位置几乎重合。这张图不是实时地图，而是结尾里使用的预设定位图。
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
      </section>
    </main>
  );
}
