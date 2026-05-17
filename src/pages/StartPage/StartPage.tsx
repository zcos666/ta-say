import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/store/useAppStore";
import type { TaPronoun } from "../../types/story";

const pronounOptions: TaPronoun[] = ["他", "她", "TA"];
const dreamIntroLines = [
  "今晚，你又梦见了她。",
  "这一次，她没有再只是你喜欢的人，而是已经默认成为了你的恋人。",
  "醒来以后，聊天框先亮了。她像什么都记得，连你没发出去的话也记得。"
] as const;

const guideItems = [
  "像和一个真实喜欢的人聊天一样回复，不需要找标准答案。",
  "你可以停顿、删改、重写，输入过程本身也会参与剧情。",
  "有些安全表达会触发异常，比如“没事”“随便”“都行”这类话。",
  "继续往下聊，留意聊天框、输入框、朋友圈和回退带来的变化。"
] as const;

const experienceNotes = [
  "这是互动叙事游戏，不会读取你的真实聊天记录、定位或通讯录。",
  "建议完整走完一轮体验，前半段先是恋爱游戏感，后半段才会慢慢失控。"
] as const;

export function StartPage() {
  const navigate = useNavigate();
  const hasFinishedGame = useAppStore((state) => state.session.hasFinishedGame);
  const isReplying = useAppStore((state) => state.isReplying);
  const resetForReplay = useAppStore((state) => state.resetForReplay);
  const selectSetup = useAppStore((state) => state.selectSetup);
  const [taPronoun, setTaPronoun] = useState<TaPronoun>("TA");
  const selectedCopy = `这轮故事里，对方会以“${taPronoun}”的方式进入聊天上下文，后续对话和翻译结果也会沿用这个称呼。`;

  return (
    <main className="screen home-page">
      <section className="shell page page-body stack home-shell">
        <div className="home-hero-stack">
          <p className="tiny">恋爱互动叙事 / DREAM LOG 01</p>
          <h1 className="hero-title">过拟合恋人</h1>
          <p className="hero-subtitle">
            某天夜里，你梦见一直喜欢的人突然成了你的恋人。醒来以后，她真的出现在聊天框里。
            这段关系会记住你删掉的话、停住的几秒，和那些没有发出去的版本。
          </p>
          <div className="home-signal-strip" aria-label="异常提示">
            <span className="home-signal-chip">先像恋爱游戏一样聊天</span>
            <span className="home-signal-chip">删改和停顿也算剧情</span>
            <span className="home-signal-chip danger">有些句子不会自己消失</span>
          </div>
        </div>

        <div className="home-intro-layout">
          <section className="card stack home-dream-card">
            <div className="home-section-heading">
              <strong>序章</strong>
              <span>先看懂这场梦，再进去聊天。</span>
            </div>
            <div className="home-dream-time">02:17 / 对方上线了</div>
            <div className="home-dream-lines">
              {dreamIntroLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </section>

          <section className="card stack home-guide-card">
            <div className="home-section-heading">
              <strong>进入前你需要知道</strong>
              <span>这不是解谜题，而是一段会记住你的聊天。</span>
            </div>
            <ul className="home-guide-list">
              {guideItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <ul className="home-guide-list subtle">
              {experienceNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
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

        <div className="card home-effect-card">
          <strong>这轮故事会从这里开始理解你</strong>
          <p className="meta-copy">{selectedCopy}</p>
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
            {isReplying ? "进入中..." : "进入这场梦"}
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
