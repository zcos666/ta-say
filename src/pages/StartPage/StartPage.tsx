import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/store/useAppStore";
import type { TaPronoun } from "../../types/story";

const pronounOptions: TaPronoun[] = ["他", "她", "TA"];
const dreamPreviewMessages = [
  "醒了吗？",
  "你今天怎么不先找我。",
  "不是说好从今天开始要多陪我一点吗？"
] as const;

const guideItems = [
  "像平时聊天一样回 TA，不需要找标准答案。",
  "先别急着退出，故事会自己开始变得不对劲。"
] as const;

const experienceNote =
  "这是带恋爱、悬疑和惊悚气质的互动叙事，不会读取你的真实聊天记录、定位或通讯录。";

export function StartPage() {
  const navigate = useNavigate();
  const isReplying = useAppStore((state) => state.isReplying);
  const resetForReplay = useAppStore((state) => state.resetForReplay);
  const selectSetup = useAppStore((state) => state.selectSetup);
  const [taPronoun, setTaPronoun] = useState<TaPronoun>("TA");
  const selectedCopy = `这一次，TA 会以“${taPronoun}”的方式出现在你面前。`;

  return (
    <main className="screen home-page">
      <section className="shell page-body home-shell">
        <div className="home-hero-stack">
          <p className="tiny">恋爱互动叙事 / DREAM LOG 01</p>
          <h1 className="hero-title">过拟合恋人</h1>
          <p className="hero-subtitle">
            某天夜里，你梦见一直喜欢的人终于成了你的恋人。醒来以后，TA 真的出现在聊天框里，
            像一切已经开始过很久。
          </p>
          <div className="home-hero-alert">如果 02:17 之后那几条消息还在继续出现，就说明你并没有完全醒。</div>
        </div>

        <div className="home-intro-layout">
          <section className="card stack home-dream-card">
            <div className="home-section-heading">
              <strong>序章</strong>
              <span>你刚醒来，而 TA 已经给你发来了消息。</span>
            </div>
            <div className="home-dream-chat" aria-label="序章聊天预览">
              <div className="home-dream-chat-meta">02:17 / 微信对话框</div>
              {dreamPreviewMessages.map((message) => (
                <div key={message} className="home-dream-message-row">
                  <span className="home-dream-avatar">{taPronoun}</span>
                  <div className="home-dream-message-stack">
                    <div className="home-dream-bubble">
                      <span>{message}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="home-dream-echo" aria-hidden="true">
                <span>正在输入</span>
                <span>正在输入</span>
                <span>正在输入</span>
              </div>
            </div>
          </section>

          <section className="card stack home-guide-card">
            <div className="home-section-heading">
              <strong>现在要做的事很简单</strong>
              <span>回 TA 的消息，然后继续聊下去。</span>
            </div>
            <ul className="home-guide-list">
              {guideItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="home-note-copy">{experienceNote}</p>
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
                <span className="choice-copy">TA 会一直以这个称呼贴近你。</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card home-effect-card">
          <strong>这一轮会被记下来的东西</strong>
          <p className="meta-copy">{selectedCopy}</p>
        </div>
        <div className="home-action-stack">
          <button
            className="button-primary home-primary-button"
            disabled={isReplying}
            onClick={async () => {
              resetForReplay();
              await selectSetup(taPronoun);
              navigate("/chat");
            }}
          >
            {isReplying ? "进入中..." : "开始聊天"}
          </button>
          <button className="button-secondary" onClick={() => navigate("/translator")}>
            进入恋爱翻译器
          </button>
        </div>
      </section>
    </main>
  );
}
