import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/store/useAppStore";
import { getSpacePosts } from "../../features/story/stageConfig";

const sampleFeedCards = [
  {
    id: "campus",
    author: "Sherlock",
    time: "今天 18:12",
    tag: "朋友动态",
    content: "支持你跨过 12 条消息之后，我有一种你终于肯认真说话的感觉。",
    images: ["球衣", "草稿", "晴天"]
  },
  {
    id: "product",
    author: "新基础（浙大 pavzzle 邀请观察）",
    time: "今天 17:08",
    tag: "技术分享",
    content: "科技感这事你已经写进 6 年级作业了，朋友圈就该留一点这种亮白、清爽、像真的生活痕迹。",
    images: ["发布会", "界面", "夜景"]
  },
  {
    id: "trip",
    author: "刘健 知识产权",
    time: "今天 15:36",
    tag: "照片动态",
    content: "一直不明白的是，为什么有些风景看起来平静，回头再看却像在提醒你别装没看见。",
    images: ["山路", "湖面", "栏杆", "云层"]
  }
] as const;

export function SpacePage() {
  const navigate = useNavigate();
  const session = useAppStore((state) => state.session);

  useEffect(() => {
    if (session.stage === "meta_break") {
      navigate("/truth", { replace: true });
    }
  }, [navigate, session.stage]);

  const posts = getSpacePosts(session.spaceVisitCount);
  const zoneTitle = session.spaceVisitCount >= 2 ? "用户的空间" : "宝宝的空间";

  return (
    <main className="space-feed-screen">
      <section className="space-feed-shell">
        <header className="space-cover-card">
          <div className="space-cover-image" />
          <div className="space-cover-meta">
            <div>
              <p className="space-cover-eyebrow">QQ 空间 / 亮白版动态流</p>
              <h1 className="space-cover-title">{zoneTitle}</h1>
              <p className="space-cover-subtitle">第 {session.spaceVisitCount} 次进入这里以后，动态开始越来越像你自己的心事。</p>
            </div>
            <div className="space-profile-chip">
              <span className="space-profile-name">{session.spaceVisitCount >= 2 ? "用户" : "宝宝"}</span>
              <span className="space-profile-avatar">{session.spaceVisitCount >= 2 ? "我" : "宝"}</span>
            </div>
          </div>
        </header>

        <div className="space-feed-layout">
          <aside className="space-sidebar-card">
            <p className="space-sidebar-label">本次异常</p>
            <div className="space-sidebar-stack">
              {posts.map((post, index) => (
                <article key={post} className="space-alert-card">
                  <span className="space-alert-index">0{index + 1}</span>
                  <p>{post}</p>
                </article>
              ))}
            </div>
            <div className="space-sidebar-actions">
              <button className="button-primary" onClick={() => navigate("/chat")}>
                回到聊天
              </button>
              <button className="button-secondary" onClick={() => navigate("/")}>
                返回开始页
              </button>
            </div>
          </aside>

          <section className="space-feed-main">
            <div className="space-feed-list">
              {sampleFeedCards.map((card, index) => (
                <article key={card.id} className="space-feed-card">
                  <header className="space-feed-card-header">
                    <div className="space-feed-card-avatar">{card.author.slice(0, 1)}</div>
                    <div className="space-feed-card-meta">
                      <strong>{card.author}</strong>
                      <span>
                        {card.tag} · {card.time}
                      </span>
                    </div>
                  </header>

                  <p className="space-feed-card-copy">{card.content}</p>

                  <div className={`space-feed-image-grid columns-${Math.min(card.images.length, 3)}`}>
                    {card.images.map((label, imageIndex) => (
                      <div key={label} className="space-feed-image-tile">
                        <span>{label}</span>
                        <small>{index + 1}-{imageIndex + 1}</small>
                      </div>
                    ))}
                  </div>

                  <footer className="space-feed-card-footer">
                    <span>{index + 2} 分钟前</span>
                    <button type="button">···</button>
                  </footer>
                </article>
              ))}

              <article className="space-feed-card highlight">
                <header className="space-feed-card-header">
                  <div className="space-feed-card-avatar accent">异</div>
                  <div className="space-feed-card-meta">
                    <strong>异常动态</strong>
                    <span>自动浮现 · 刚刚</span>
                  </div>
                </header>

                <div className="space-sidebar-stack compact">
                  {posts.map((post) => (
                    <article key={post} className="space-alert-card compact">
                      <p>{post}</p>
                    </article>
                  ))}
                </div>

                <footer className="space-feed-card-footer">
                  <span>只有你看得到这组动态</span>
                  <button type="button">···</button>
                </footer>
              </article>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
