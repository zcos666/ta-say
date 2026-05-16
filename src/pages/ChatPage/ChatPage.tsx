import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/store/useAppStore";
import { getStageStatus } from "../../features/story/stageConfig";

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function ChatPage() {
  const navigate = useNavigate();
  const session = useAppStore((state) => state.session);
  const isReplying = useAppStore((state) => state.isReplying);
  const sendMessage = useAppStore((state) => state.sendMessage);
  const updateDraft = useAppStore((state) => state.updateDraft);
  const loadGame = useAppStore((state) => state.loadGame);
  const visitSpace = useAppStore((state) => state.visitSpace);
  const exitAttempt = useAppStore((state) => state.exitAttempt);
  const getLoadLabel = useAppStore((state) => state.getLoadLabel);
  const getSpaceLabel = useAppStore((state) => state.getSpaceLabel);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!session.fearType || !session.taPronoun) {
      navigate("/", { replace: true });
      return;
    }

    if (session.stage === "meta_break" || session.stage === "truth_reveal") {
      navigate("/truth");
    }
  }, [navigate, session.fearType, session.stage, session.taPronoun]);

  const latestMessage = session.chatHistory[session.chatHistory.length - 1];

  const conversationItems = useMemo(() => {
    const previewText = latestMessage?.displayedText ?? "开始新的聊天";
    const previewTime = latestMessage ? formatTime(latestMessage.timestamp) : "刚刚";

    return [
      {
        id: "z",
        name: "Z.",
        preview: previewText,
        time: previewTime,
        active: true
      },
      {
        id: "assistant",
        name: "文件传输助手",
        preview: "把图片、文件和记录都放在这里。",
        time: "昨天",
        active: false
      },
      {
        id: "favorite",
        name: "收藏",
        preview: "你标记过的聊天内容会出现在这里。",
        time: "周二",
        active: false
      },
      {
        id: "group",
        name: "工作群",
        preview: "下午三点同步一下方案进度。",
        time: "周一",
        active: false
      }
    ];
  }, [latestMessage]);

  function handleSend() {
    if (!draft.trim() || isReplying) {
      return;
    }

    void sendMessage(draft);
    setDraft("");
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <main className="screen desktop-chat-screen">
      <section className="desktop-chat-shell">
        <aside className="desktop-app-sidebar" aria-label="功能导航">
          <div className="desktop-app-sidebar-top">
            <button className="desktop-app-avatar" type="button">
              ME
            </button>
            <button className="desktop-app-icon active" type="button">
              C
            </button>
            <button className="desktop-app-icon" type="button">
              P
            </button>
            <button className="desktop-app-icon" type="button">
              F
            </button>
            <button className="desktop-app-icon" type="button">
              S
            </button>
          </div>

          <div className="desktop-app-sidebar-bottom">
            <button className="desktop-app-icon" type="button" onClick={() => navigate("/")}>
              B
            </button>
          </div>
        </aside>

        <aside className="desktop-chat-list">
          <header className="desktop-chat-list-header">
            <label className="desktop-search">
              <span className="desktop-search-icon">/</span>
              <input type="text" placeholder="搜索" />
            </label>
          </header>

          <div className="desktop-chat-list-scroll">
            {conversationItems.map((item) => (
              <button key={item.id} className={`desktop-conversation-item${item.active ? " active" : ""}`} type="button">
                <span className="desktop-conversation-avatar">{item.name.slice(0, 1)}</span>
                <span className="desktop-conversation-body">
                  <span className="desktop-conversation-row">
                    <strong>{item.name}</strong>
                    <time>{item.time}</time>
                  </span>
                  <span className="desktop-conversation-preview">{item.preview}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="desktop-chat-main">
          <header className="desktop-chat-header">
            <div>
              <h1 className="desktop-chat-title">Z.</h1>
              <p className="desktop-chat-subtitle">{isReplying ? "正在输入..." : getStageStatus(session.stage)}</p>
            </div>
            <div className="desktop-chat-header-actions">
              <button
                className="desktop-header-button"
                type="button"
                onClick={() => {
                  visitSpace();
                  navigate("/space");
                }}
              >
                {getSpaceLabel()}
              </button>
              <button className="desktop-header-button" type="button" onClick={loadGame}>
                {getLoadLabel()}
              </button>
              <button className="desktop-header-button icon" type="button" onClick={exitAttempt}>
                ...
              </button>
            </div>
          </header>

          <div className="desktop-chat-stream">
            {session.chatHistory.map((message, index) => {
              const previousRole = index > 0 ? session.chatHistory[index - 1]?.role : null;
              const grouped = previousRole === message.role;

              return (
                <article
                  key={message.id}
                  className={`desktop-message-row ${message.role}${grouped ? " is-grouped" : ""}`}
                >
                  {message.role !== "user" ? (
                    <span className={`desktop-message-avatar ${message.role}`}>{message.role === "ta" ? "Z" : "S"}</span>
                  ) : null}

                  <div className={`desktop-message-stack ${message.role}`}>
                    <div className={`desktop-message-bubble ${message.role}`}>
                      <span>{message.displayedText}</span>
                    </div>
                    <time className="desktop-message-time">{formatTime(message.timestamp)}</time>
                  </div>

                  {message.role === "user" ? <span className="desktop-message-avatar user">ME</span> : null}
                </article>
              );
            })}
          </div>

          <footer className="desktop-chat-composer">
            <div className="desktop-composer-toolbar">
              <button className="desktop-toolbar-button" type="button">
                :)
              </button>
              <button className="desktop-toolbar-button" type="button">
                File
              </button>
              <button className="desktop-toolbar-button" type="button">
                Shot
              </button>
              <button className="desktop-toolbar-button" type="button">
                Call
              </button>
              <button className="desktop-toolbar-button" type="button">
                Video
              </button>
            </div>

            <div className="desktop-composer-editor">
              <div className="desktop-composer-input-wrap">
                <textarea
                  className="desktop-chat-input"
                  placeholder="输入消息"
                  disabled={isReplying}
                  value={draft}
                  onKeyDown={handleInputKeyDown}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    updateDraft(draft, nextValue);
                    setDraft(nextValue);
                  }}
                />
                <span className="desktop-enter-hint">Enter 发送</span>
              </div>
              <button className="desktop-send-button" type="button" disabled={isReplying} onClick={handleSend}>
                {isReplying ? "发送中" : "发送"}
              </button>
            </div>
          </footer>
        </section>
      </section>
    </main>
  );
}
