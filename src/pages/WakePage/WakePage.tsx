import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/store/useAppStore";
import { wakeLines } from "../../features/story/stageConfig";

export function WakePage() {
  const navigate = useNavigate();
  const finishWakeUp = useAppStore((state) => state.finishWakeUp);

  useEffect(() => {
    finishWakeUp();
  }, [finishWakeUp]);

  return (
    <main className="screen final-transition-screen">
      <section className="shell page page-body stack wake-stage-entry">
        {wakeLines.map((line) => (
          <div key={line} className="card">
            {line}
          </div>
        ))}
        <div className="spacer" />
        <div className="stack">
          <button className="button-secondary" onClick={() => navigate("/translator")}>
            继续翻译没说出口的话
          </button>
        </div>
      </section>
    </main>
  );
}
