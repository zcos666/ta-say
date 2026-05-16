import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/store/useAppStore";
import { getSpacePosts } from "../../features/story/stageConfig";

export function SpacePage() {
  const navigate = useNavigate();
  const session = useAppStore((state) => state.session);

  useEffect(() => {
    if (session.stage === "meta_break") {
      navigate("/truth", { replace: true });
    }
  }, [navigate, session.stage]);

  const posts = getSpacePosts(session.spaceVisitCount);

  return (
    <main className="screen">
      <section className="shell page page-body stack">
        <div>
          <p className="tiny">空间异常分支 / 第 {session.spaceVisitCount} 次进入</p>
          <h2 className="hero-title">{session.spaceVisitCount >= 2 ? "你的空间" : "TA 的空间"}</h2>
          <p className="hero-subtitle">如果你多看两次，这里会开始出现不该属于任何人的动态。</p>
        </div>

        <div className="stack">
          {posts.map((post) => (
            <article key={post} className="card">
              {post}
            </article>
          ))}
        </div>

        <div className="spacer" />

        <div className="stack">
          <button className="button-primary" onClick={() => navigate("/chat")}>
            回到聊天
          </button>
          <button className="button-secondary" onClick={() => navigate("/")}>
            先退回开始页
          </button>
        </div>
      </section>
    </main>
  );
}
