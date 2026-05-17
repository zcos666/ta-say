import { useEffect, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/store/useAppStore";

const locationImageUrl = new URL("../../../c57832db96fa00de7e7da50eb070bd31.png", import.meta.url).href;

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    padding: "clamp(12px, 4vw, 24px)",
    background: "radial-gradient(circle at top, rgba(149, 236, 105, 0.12), transparent 35%), #090909",
    color: "#f4f4f4",
  },
  shell: {
    width: "min(100%, 1100px)",
    display: "grid",
    gap: 16,
  },
  card: {
    display: "grid",
    gap: 16,
  },
  locationFrame: {
    position: "relative",
    minHeight: "min(520px, 58dvh)",
    overflow: "hidden",
    borderRadius: "clamp(18px, 4vw, 28px)",
    background: "linear-gradient(180deg, rgba(12, 12, 12, 0.06), rgba(12, 12, 12, 0.22))",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.35)",
  },
  locationImage: {
    display: "block",
    width: "100%",
    height: "100%",
    minHeight: "min(520px, 58dvh)",
    objectFit: "cover",
  },
  imageShade: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(14, 14, 18, 0.14))",
    pointerEvents: "none",
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
          <section style={styles.locationFrame} aria-label="定位图">
            <img src={locationImageUrl} alt="TA 发来的定位截图" style={styles.locationImage} />
            <div style={styles.imageShade} />
          </section>
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
