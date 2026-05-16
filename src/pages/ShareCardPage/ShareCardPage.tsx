import { useNavigate } from "react-router-dom";

export function ShareCardPage() {
  const navigate = useNavigate();

  return (
    <main className="screen">
      <section className="shell page page-body stack">
        <p className="tiny">分享卡占位</p>
        <h2 className="hero-title">关系幻觉报告</h2>
        <div className="card">该页面由开发者 B 继续接入数据模型与导出能力。当前仅保留稳定路由与通路占位。</div>
        <div className="spacer" />
        <div className="stack">
          <button className="button-primary" onClick={() => navigate("/translator")}>
            返回翻译官
          </button>
          <button className="button-secondary" onClick={() => navigate("/")}>
            返回开始页
          </button>
        </div>
      </section>
    </main>
  );
}
