import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/store/useAppStore";
import type { FearType, TaPronoun } from "../../types/story";

const fearOptions: Array<{ value: FearType; copy: string }> = [
  { value: "害怕被抛下", copy: "会下意识把委屈说轻，免得显得自己离不开谁。" },
  { value: "害怕被控制", copy: "容易先说随便，真正的边界总是拖到最后才说。" }
];

const pronounOptions: TaPronoun[] = ["他", "她", "TA"];

export function StartPage() {
  const navigate = useNavigate();
  const hasFinishedGame = useAppStore((state) => state.session.hasFinishedGame);
  const isReplying = useAppStore((state) => state.isReplying);
  const resetForReplay = useAppStore((state) => state.resetForReplay);
  const selectSetup = useAppStore((state) => state.selectSetup);
  const [fearType, setFearType] = useState<FearType>("害怕被抛下");
  const [taPronoun, setTaPronoun] = useState<TaPronoun>("TA");

  const selectedCopy = useMemo(
    () => fearOptions.find((option) => option.value === fearType)?.copy,
    [fearType]
  );

  return (
    <main className="screen">
      <section className="shell page page-body stack">
        <p className="tiny">互动叙事游戏 / 开发者 A 的主链路实现</p>
        <h1 className="hero-title">过拟合恋人</h1>
        <p className="hero-subtitle">
          前半段是恋爱聊天，后半段是被你自己没说出口的话反过来追上来。
        </p>

        <div className="card stack">
          <strong>当前版本包含</strong>
          <span className="meta-copy">
            开始页、聊天主链路、关键词污染、草稿监听、读档三态、空间异常、真相页与梦醒页。
          </span>
        </div>

        <div className="card stack">
          <strong>体验提醒</strong>
          <span className="meta-copy">
            这是一个明确标注的互动叙事游戏。不会调用真实定位、通讯录或后台监听。
          </span>
        </div>

        <div className="stack">
          <strong>你更怕哪一种关系失控？</strong>
          <div className="choice-grid">
            {fearOptions.map((option) => (
              <button
                key={option.value}
                className={`choice-button${fearType === option.value ? " active" : ""}`}
                onClick={() => setFearType(option.value)}
              >
                <span className="choice-title">{option.value}</span>
                <span className="choice-copy">{option.copy}</span>
              </button>
            ))}
          </div>
        </div>

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

        <div className="card">
          <strong>当前效果</strong>
          <p className="meta-copy">{selectedCopy}</p>
        </div>

        <div className="spacer" />

        <div className="stack">
          <button
            className="button-primary"
            disabled={isReplying}
            onClick={async () => {
              resetForReplay();
              await selectSetup(fearType, taPronoun);
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
