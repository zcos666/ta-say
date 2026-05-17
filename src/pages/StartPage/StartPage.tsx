import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/store/useAppStore";
import type { TaPronoun } from "../../types/story";

const pronounOptions: TaPronoun[] = ["他", "她", "TA"];

export function StartPage() {
  const navigate = useNavigate();
  const hasFinishedGame = useAppStore((state) => state.session.hasFinishedGame);
  const isReplying = useAppStore((state) => state.isReplying);
  const resetForReplay = useAppStore((state) => state.resetForReplay);
  const selectSetup = useAppStore((state) => state.selectSetup);
  const [taPronoun, setTaPronoun] = useState<TaPronoun>("TA");

  return (
    <main className="screen home-page">
      <section className="shell page page-body stack home-shell">
        <div className="stack">
          <strong>TA 以什么称呼出现？</strong>
          <div className="choice-grid">
            {pronounOptions.map((option) => (
              <button
                key={option}
                className={`choice-button${taPronoun === option ? " active" : ""}`}
                onClick={() => setTaPronoun(option)}
              >
                <span className="choice-title">{option}</span>
                <span className="choice-copy">这个选择会进入聊天上下文与 LLM 提示词。</span>
              </button>
            ))}
          </div>
        </div>

        <div className="spacer" />

        <div className="stack">
          <button
            className="button-primary"
            disabled={isReplying}
            onClick={async () => {
              resetForReplay();
              await selectSetup(taPronoun);
              navigate("/chat");
            }}
          >
            {isReplying ? "进入中..." : "开始聊天"}
          </button>
          {hasFinishedGame ? (
            <button className="button-secondary" onClick={() => navigate("/translator")}>
              进入恋爱翻译官
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
