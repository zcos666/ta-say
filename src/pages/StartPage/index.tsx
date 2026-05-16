import { Link } from "react-router-dom";
import { useSessionStore } from "../../app/store/sessionStore";

export default function StartPage() {
  const hasFinishedGame = useSessionStore((state) => state.hasFinishedGame);
  const patchSession = useSessionStore((state) => state.patchSession);

  function loadDemoPreview() {
    patchSession({
      fearType: "害怕说真话",
      taPronoun: "TA",
      stage: "share_ready",
      hasFinishedGame: true,
      endingType: "梦醒翻译家",
      hardestSentence: "没事，你忙吧。",
      pollutionCount: 7,
      deletedDraftCount: 3,
      loadCount: 2,
      deletedDrafts: ["其实我没有没事。"],
      triggeredKeywords: ["没事", "算了"],
      translatorReport: {
        original: "没事，你忙吧。",
        possibleMeaning: "我其实很在意，只是还没准备好把受伤直接说出口。",
        sharpTranslation: "我不是没事，我是在等你发现我已经失望了。",
        betterExpression: "我知道你可能在忙，但我等了很久，心里有点失落。你愿意告诉我刚刚发生了什么吗？",
        actionAdvice: "先说感受，再说期待，比让对方猜更容易被接住。",
      },
      shareCardData: {
        endingType: "梦醒翻译家",
        hardestSentence: "没事，你忙吧。",
        shareLine: "通关之后，你终于肯把情绪翻译成人话。",
        fearType: "害怕说真话",
        pollutionCount: 7,
        deletedDraftCount: 3,
        loadCount: 2,
        aiTranslation: "我不是没事，我是在等你发现我已经失望了。",
      },
    });
  }

  return (
    <main className="home-page">
      <section className="hero-card">
        <p className="eyebrow">Start Page Placeholder</p>
        <h1>《ta说》主流程入口待接入</h1>
        <p className="lead">
          当前仓库由游戏B先行落地共享底座。A 线主剧情页接入前，这里先提供一个预览入口，方便直接查看翻译官和分享卡效果。
        </p>
        <div className="status-grid">
          <article className="status-item">
            <span>当前状态</span>
            <strong>{hasFinishedGame ? "已加载演示进度，可直接预览" : "预览模式，可直接进入后续功能"}</strong>
          </article>
          <article className="status-item">
            <span>B 模块</span>
            <strong>翻译官 / 分享卡已可独立验证</strong>
          </article>
        </div>
        <div className="action-row">
          <button className="primary-link" type="button" onClick={loadDemoPreview}>
            一键加载演示数据
          </button>
          <Link className="secondary-link" to="/translator">
            直接看翻译官
          </Link>
          <Link className="secondary-link" to="/share">
            直接看分享卡
          </Link>
        </div>
        <p className="lead">
          如果你只是想先看后面的页面效果，直接点上面的两个入口就行；如果想看更完整的展示内容，先点“一键加载演示数据”。
        </p>
      </section>
    </main>
  );
}
