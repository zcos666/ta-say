import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/store/useAppStore";
import { exitCopy, mockChatCopy, rollbackCopy } from "../../config/hardcodedCopy";
import { getStageStatus } from "../../features/story/stageConfig";
import type { ChatMessage } from "../../types/session";

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function createMockTimestamp(hour: number, minute: number) {
  const now = new Date();
  now.setHours(hour, minute, 0, 0);
  return now.getTime();
}

function createMockMessage(
  id: string,
  role: ChatMessage["role"],
  displayedText: string,
  hour: number,
  minute: number,
): ChatMessage {
  return {
    id,
    role,
    displayedText,
    kind: "normal",
    timestamp: createMockTimestamp(hour, minute)
  };
}

type MockConversation = {
  id: string;
  name: string;
  subtitle: string;
  avatarLabel: string;
  messages: ChatMessage[];
  replyPool: string[];
  view?: "chat" | "articles";
  articles?: Array<{
    id: string;
    source: string;
    title: string;
    meta: string;
    summary: string;
    tag?: string;
  }>;
};

function createInitialMockConversations(): Record<string, MockConversation> {
  return {
    assistant: {
      ...mockChatCopy.assistant,
      messages: mockChatCopy.assistant.messages.map((message) =>
        createMockMessage(message.id, message.role, message.displayedText, message.hour, message.minute)
      ),
      replyPool: [...mockChatCopy.assistant.replyPool]
    },
    favorite: {
      ...mockChatCopy.favorite,
      articles: [...mockChatCopy.favorite.articles],
      messages: mockChatCopy.favorite.messages.map((message) =>
        createMockMessage(message.id, message.role, message.displayedText, message.hour, message.minute)
      ),
      replyPool: [...mockChatCopy.favorite.replyPool]
    },
    group: {
      ...mockChatCopy.group,
      messages: mockChatCopy.group.messages.map((message) =>
        createMockMessage(message.id, message.role, message.displayedText, message.hour, message.minute)
      ),
      replyPool: [...mockChatCopy.group.replyPool]
    }
  };
}

function ChatSidebarIcon() {
  return (
    <svg className="desktop-sidebar-svg chat" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.5" y="5" width="15" height="13.5" rx="4.2" />
      <circle cx="12" cy="11.75" r="2.55" />
    </svg>
  );
}

function SpaceSidebarIcon() {
  return (
    <svg className="desktop-sidebar-svg space" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="7.2" />
      <path d="M12 4.8c1.8 1.8 2.8 4.3 2.8 7.2s-1 5.4-2.8 7.2c-1.8-1.8-2.8-4.3-2.8-7.2s1-5.4 2.8-7.2Z" />
      <path d="M4.8 12h14.4" />
      <path d="M7.2 7.2c1.5 1 3.1 1.5 4.8 1.5s3.3-.5 4.8-1.5" />
      <path d="M7.2 16.8c1.5-1 3.1-1.5 4.8-1.5s3.3.5 4.8 1.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="desktop-search-svg" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="4.5" />
      <path d="M12 12l4 4" />
    </svg>
  );
}

function getChatDisturbanceLevel(stage: string) {
  switch (stage) {
    case "first_pollution":
    case "draft_exposed":
    case "time_pollution":
      return 1;
    case "save_loaded_once":
    case "save_loaded_twice":
    case "location_reveal":
      return 2;
    case "location_aftermath":
    case "meta_break":
    case "truth_reveal":
      return 3;
    default:
      return 0;
  }
}

function normalizeHauntingText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function ChatPage() {
  const navigate = useNavigate();
  const session = useAppStore((state) => state.session);
  const isReplying = useAppStore((state) => state.isReplying);
  const isTaTyping = useAppStore((state) => state.isTaTyping);
  const pendingUserMessages = useAppStore((state) => state.pendingUserMessages);
  const draftWhisper = useAppStore((state) => state.draftWhisper);
  const draftEditCount = useAppStore((state) => state.draftEditCount);
  const draftPauseLevel = useAppStore((state) => state.draftPauseLevel);
  const sendMessage = useAppStore((state) => state.sendMessage);
  const updateDraft = useAppStore((state) => state.updateDraft);
  const rollbackToMessage = useAppStore((state) => state.rollbackToMessage);
  const visitSpace = useAppStore((state) => state.visitSpace);
  const exitAttempt = useAppStore((state) => state.exitAttempt);
  const enterTruthReveal = useAppStore((state) => state.enterTruthReveal);
  const revealLocationLie = useAppStore((state) => state.revealLocationLie);
  const getSpaceLabel = useAppStore((state) => state.getSpaceLabel);
  const [draft, setDraft] = useState("");
  const [rollbackMode, setRollbackMode] = useState(false);
  const rollbackDisabled = session.loadCount >= 3;
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState("z");
  const [mockReplyingConversationId, setMockReplyingConversationId] = useState<string | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [mockConversations, setMockConversations] = useState<Record<string, MockConversation>>(() =>
    createInitialMockConversations()
  );
  const streamRef = useRef<HTMLDivElement | null>(null);
  const pendingTimersRef = useRef<number[]>([]);
  const toastTimerRef = useRef<number | null>(null);
  const lastToastMessageIdRef = useRef<string | null>(null);
  const [systemToast, setSystemToast] = useState<ChatMessage | null>(null);

  useEffect(() => {
    if (!session.fearType || !session.taPronoun) {
      navigate("/", { replace: true });
      return;
    }

    if (session.stage === "meta_break" || session.stage === "truth_reveal") {
      navigate("/truth");
    }
  }, [navigate, session.fearType, session.stage, session.taPronoun]);

  useEffect(() => {
    if (session.stage !== "location_aftermath") {
      return;
    }

    if (session.metaMemory.includes("定位结尾已进入真相页。")) {
      return;
    }

    const lieTimer = window.setTimeout(() => {
      revealLocationLie();
    }, 5000);

    const truthTimer = window.setTimeout(() => {
      useAppStore.getState().patchSession({
        metaMemory: [...useAppStore.getState().session.metaMemory, "定位结尾已进入真相页。"]
      });
      enterTruthReveal();
      navigate("/truth");
    }, 10000);

    return () => {
      window.clearTimeout(lieTimer);
      window.clearTimeout(truthTimer);
    };
  }, [enterTruthReveal, navigate, revealLocationLie, session.stage]);

  useEffect(() => {
    return () => {
      pendingTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const latestMessage = session.chatHistory[session.chatHistory.length - 1];
  const exitDialogTitle =
    session.exitClickCount >= 2
      ? exitCopy.dialogTitles.locked
      : session.exitClickCount >= 1
        ? exitCopy.dialogTitles.warning
        : exitCopy.dialogTitles.default;
  const exitDialogBody =
    session.exitClickCount >= 2
      ? exitCopy.dialogBodies.locked
      : session.exitClickCount >= 1
        ? exitCopy.dialogBodies.warning
        : exitCopy.dialogBodies.default;
  const disturbanceLevel = getChatDisturbanceLevel(session.stage);
  const hauntingLines = [
    ...session.deletedDrafts.slice(-2).map(normalizeHauntingText),
    session.hardestSentence ? normalizeHauntingText(session.hardestSentence) : "",
    latestMessage?.role === "user" ? normalizeHauntingText(latestMessage.displayedText) : "",
  ].filter(Boolean);
  const primaryHauntingLine = hauntingLines[0] || "";
  const disturbanceCopy =
    primaryHauntingLine ||
    draftWhisper ||
    (disturbanceLevel >= 3
      ? "它不只是停在输入框后面，它在等你把真正那句打出来。"
      : disturbanceLevel === 2
        ? "这块区域开始记住你删掉的版本。"
        : disturbanceLevel === 1
          ? "输入框后面有东西在跟着你的停顿。"
          : "");
  const composerWarning =
    draftWhisper ||
    (disturbanceLevel >= 3
      ? "异常增强：输入框后方出现持续残影。"
      : disturbanceLevel === 2
        ? "异常提示：删改痕迹正在被保留。"
        : disturbanceLevel === 1
          ? "异常提示：这里开始变得不太对。"
          : "");

  const conversationItems = useMemo(() => {
    const storyPreviewText = latestMessage?.displayedText ?? "开始新的聊天";
    const storyPreviewTime = latestMessage ? formatTime(latestMessage.timestamp) : "刚刚";
    const allItems = [
      {
        id: "z",
        name: "宝宝",
        subtitle: getStageStatus(session.stage),
        avatarLabel: "宝",
        preview: storyPreviewText,
        time: storyPreviewTime
      },
      ...Object.values(mockConversations).map((conversation) => {
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        const articlePreview = conversation.view === "articles" ? conversation.articles?.[0]?.title : undefined;
        return {
          id: conversation.id,
          name: conversation.name,
          subtitle: conversation.subtitle,
          avatarLabel: conversation.avatarLabel,
          preview: articlePreview ?? lastMessage?.displayedText ?? "点开看看有没有新消息",
          time: lastMessage ? formatTime(lastMessage.timestamp) : "刚刚"
        };
      })
    ];
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      return allItems;
    }
    return allItems.filter((item) => {
      const haystack = `${item.name} ${item.preview} ${item.subtitle}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [getStageStatus, latestMessage, mockConversations, searchKeyword, session.stage]);

  const currentConversation = useMemo(() => {
    if (selectedConversationId === "z") {
      return {
        id: "z",
        name: "宝宝",
        subtitle: getStageStatus(session.stage),
        avatarLabel: "宝",
        isStory: true,
        view: "chat" as const,
        articles: [],
        messages: [...session.chatHistory, ...pendingUserMessages]
      };
    }

    const mockConversation = mockConversations[selectedConversationId];
    if (mockConversation) {
      return {
        ...mockConversation,
        isStory: false
      };
    }

    return {
      id: "z",
      name: "宝宝",
      subtitle: getStageStatus(session.stage),
      avatarLabel: "宝",
      isStory: true,
      view: "chat" as const,
      articles: [],
      messages: session.chatHistory
    };
  }, [getStageStatus, mockConversations, pendingUserMessages, selectedConversationId, session.chatHistory, session.stage]);
  const showComposerDisturbance = currentConversation.id === "z" && (disturbanceLevel > 0 || Boolean(draftWhisper));

  useEffect(() => {
    const node = streamRef.current;
    if (!node) {
      return;
    }
    node.scrollTop = node.scrollHeight;
  }, [currentConversation.messages, selectedConversationId]);

  useEffect(() => {
    if (currentConversation.id !== "z") {
      setSystemToast(null);
      lastToastMessageIdRef.current = null;
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
      return;
    }

    const latestSystemNotice = [...currentConversation.messages]
      .reverse()
      .find((message) => message.role === "system" && (message.kind === "warning" || message.kind === "glitch"));

    if (!latestSystemNotice || lastToastMessageIdRef.current === latestSystemNotice.id) {
      return;
    }

    lastToastMessageIdRef.current = latestSystemNotice.id;
    setSystemToast(latestSystemNotice);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setSystemToast((current) => (current?.id === latestSystemNotice.id ? null : current));
      toastTimerRef.current = null;
    }, 3200);
  }, [currentConversation.id, currentConversation.messages]);

  function handleSend() {
    const nextDraft = draft.trim();
    const isStoryConversation = currentConversation.id === "z";
    const isStoryLocked =
      isStoryConversation &&
      (session.stage === "location_reveal" || session.stage === "location_aftermath");
    const isConversationBusy = isStoryConversation
      ? isStoryLocked
      : mockReplyingConversationId === currentConversation.id;

    if (!nextDraft || isConversationBusy) {
      return;
    }

    if (isStoryConversation) {
      void sendMessage(nextDraft);
      setDraft("");
      return;
    }

    const currentMockConversation = mockConversations[currentConversation.id];
    if (!currentMockConversation) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `${currentConversation.id}-${Date.now()}-user`,
      role: "user",
      displayedText: nextDraft,
      kind: "normal",
      timestamp: Date.now()
    };

    setMockConversations((current) => ({
      ...current,
      [currentConversation.id]: {
        ...currentMockConversation,
        messages: [...currentMockConversation.messages, userMessage]
      }
    }));
    setDraft("");

    if (currentConversation.id === "assistant" || currentMockConversation.replyPool.length === 0) {
      return;
    }

    const replyText =
      currentMockConversation.replyPool[
        currentMockConversation.messages.length % currentMockConversation.replyPool.length
      ];
    setMockReplyingConversationId(currentConversation.id);

    const timer = window.setTimeout(() => {
      setMockConversations((current) => {
        const targetConversation = current[currentConversation.id];
        if (!targetConversation) {
          return current;
        }

        const replyMessage: ChatMessage = {
          id: `${currentConversation.id}-${Date.now()}-reply`,
          role: "ta",
          displayedText: replyText,
          kind: "normal",
          timestamp: Date.now()
        };

        return {
          ...current,
          [currentConversation.id]: {
            ...targetConversation,
            messages: [...targetConversation.messages, replyMessage]
          }
        };
      });
      setMockReplyingConversationId((current) => (current === currentConversation.id ? null : current));
    }, 520);

    pendingTimersRef.current.push(timer);
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
            <button className="desktop-app-icon active" type="button" aria-label="聊天">
              <ChatSidebarIcon />
            </button>
            <button
              className="desktop-app-icon"
              type="button"
              aria-label={getSpaceLabel()}
              title={getSpaceLabel()}
              onClick={() => {
                visitSpace();
                navigate("/space");
              }}
            >
              <SpaceSidebarIcon />
            </button>
          </div>
        </aside>

        <aside className="desktop-chat-list">
          <header className="desktop-chat-list-header">
            <label className="desktop-search">
              <span className="desktop-search-icon">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="搜索"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </label>
          </header>

          <div className="desktop-chat-list-scroll">
            {conversationItems.map((item) => (
              <button
                key={item.id}
                className={`desktop-conversation-item${selectedConversationId === item.id ? " active" : ""}`}
                type="button"
                onClick={() => {
                  setSelectedConversationId(item.id);
                  setRollbackMode(false);
                }}
              >
                <span className="desktop-conversation-avatar">{item.avatarLabel}</span>
                <span className="desktop-conversation-body">
                  <span className="desktop-conversation-row">
                    <strong>{item.name}</strong>
                    <time>{item.time}</time>
                  </span>
                  <span className="desktop-conversation-subtitle">{item.subtitle}</span>
                  <span className="desktop-conversation-preview">{item.preview}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className={`desktop-chat-main disturbance-${disturbanceLevel}`}>
          {currentConversation.id === "z" && disturbanceLevel > 0 ? (
            <div className={`desktop-haunting-presence disturbance-${disturbanceLevel}`} aria-hidden="true">
              <div className="desktop-haunting-shadow" />
              <div className="desktop-haunting-copy">
                {(hauntingLines.length > 0 ? hauntingLines : ["你删掉的那句还在看着这里。"]).map((line, index) => (
                  <span key={`${line}-${index}`}>{line}</span>
                ))}
              </div>
            </div>
          ) : null}
          <header className="desktop-chat-header">
            <div>
              <h1 className="desktop-chat-title">{currentConversation.name}</h1>
              <p className="desktop-chat-subtitle">
                {currentConversation.id === "z" && (isReplying || isTaTyping)
                  ? "对方正在输入中"
                  : currentConversation.id !== "z" && mockReplyingConversationId === currentConversation.id
                    ? "正在输入..."
                    : currentConversation.subtitle}
              </p>
            </div>
            <div className="desktop-chat-header-actions">
              {currentConversation.isStory ? (
                <button
                  className={`desktop-header-button${rollbackDisabled ? " rollback-alert" : ""}`}
                  type="button"
                  disabled={rollbackDisabled || isReplying || isTaTyping}
                  aria-label={
                    rollbackDisabled ? rollbackCopy.buttonDisabledTitle : rollbackMode ? "取消回退模式" : "进入回退模式"
                  }
                  title={rollbackDisabled ? rollbackCopy.buttonDisabledTitle : rollbackMode ? "取消回退模式" : "进入回退模式"}
                  onClick={() => {
                    if (rollbackDisabled) {
                      return;
                    }
                    setRollbackMode((current) => !current);
                  }}
                >
                  {rollbackDisabled ? "读档？" : rollbackMode ? "取消读档" : "读档"}
                </button>
              ) : null}
              <button
                className="desktop-header-button icon windows-close-button"
                type="button"
                disabled={currentConversation.isStory && (isReplying || isTaTyping)}
                aria-label={
                  session.exitClickCount >= 2
                    ? exitCopy.closeButtonTitles.locked
                    : session.exitClickCount >= 1
                      ? exitCopy.closeButtonTitles.warning
                      : exitCopy.closeButtonTitles.default
                }
                title={
                  session.exitClickCount >= 2
                    ? exitCopy.closeButtonTitles.locked
                    : session.exitClickCount >= 1
                      ? exitCopy.closeButtonTitles.warning
                      : exitCopy.closeButtonTitles.default
                }
                onClick={() => {
                  if (currentConversation.isStory) {
                    setShowExitDialog(true);
                    return;
                  }
                  void exitAttempt();
                }}
              >
                ×
              </button>
            </div>
          </header>

          <div ref={streamRef} className="desktop-chat-stream">
            {currentConversation.view === "articles" ? (
              <section className="favorite-article-feed" aria-label="收藏文章列表">
                {currentConversation.articles?.map((article: NonNullable<MockConversation["articles"]>[number]) => (
                  <article key={article.id} className="favorite-article-card">
                    <header className="favorite-article-header">
                      <div className="favorite-article-source">
                        <span className="favorite-article-avatar">{article.source.slice(0, 1)}</span>
                        <strong>{article.source}</strong>
                      </div>
                      <div className="favorite-article-meta">
                        <span>{article.meta}</span>
                        {article.tag ? <span>{article.tag}</span> : null}
                      </div>
                    </header>
                    <h2 className="favorite-article-title">{article.title}</h2>
                    <p className="favorite-article-summary">{article.summary}</p>
                    <footer className="favorite-article-footer">
                      <span>公众号文章</span>
                      <button type="button">查看</button>
                    </footer>
                  </article>
                ))}
              </section>
            ) : (
              <>
                {currentConversation.messages.map((message, index) => {
              const previousRole = index > 0 ? currentConversation.messages[index - 1]?.role : null;
              const grouped = previousRole === message.role;

              if (message.kind === "space_notice") {
                return (
                  <article key={message.id} className="desktop-space-notice-row">
                    <div className="desktop-space-notice-card">
                      <div className="desktop-space-notice-badge">朋友圈提醒</div>
                      <strong className="desktop-space-notice-title">{currentConversation.name}刚刚更新了朋友圈</strong>
                      <p className="desktop-space-notice-copy">{message.displayedText.replace(/^.*(?:空间|朋友圈)：/, "")}</p>
                      <time className="desktop-space-notice-time">{formatTime(message.timestamp)}</time>
                    </div>
                  </article>
                );
              }

              if (message.kind === "location_notice") {
                return (
                  <article key={message.id} className="desktop-space-notice-row">
                    <div className="desktop-space-notice-card">
                      <div className="desktop-space-notice-badge">定位共享</div>
                      <strong className="desktop-space-notice-title">对方发来一张定位图</strong>
                      <p className="desktop-space-notice-copy">最后一句已经被强制改成了“你在哪？”。</p>
                      <button
                        className="desktop-message-rollback"
                        type="button"
                        onClick={() => navigate("/location")}
                      >
                        查看定位
                      </button>
                      <time className="desktop-space-notice-time">{formatTime(message.timestamp)}</time>
                    </div>
                  </article>
                );
              }

              if (message.role === "system") {
                return null;
              }

              return (
                <article
                  key={message.id}
                  className={`desktop-message-row ${message.role}${grouped ? " is-grouped" : ""}`}
                >
                  {message.role !== "user" ? (
                    <span className={`desktop-message-avatar ${message.role}`}>
                      {message.role === "ta" ? currentConversation.avatarLabel : "系"}
                    </span>
                  ) : null}

                  {message.role === "user" && message.kind === "pending" ? (
                    <span className="desktop-message-pending-spinner" aria-label="等待发送" />
                  ) : null}

                  <div className={`desktop-message-stack ${message.role}`}>
                    <div className={`desktop-message-bubble ${message.role}`}>
                      <span>{message.displayedText}</span>
                    </div>
                    {currentConversation.isStory && rollbackMode && message.role !== "system" && message.kind !== "pending" ? (
                      <button
                        className="desktop-message-rollback"
                        type="button"
                        disabled={isReplying || isTaTyping || rollbackDisabled}
                        onClick={() => {
                          const confirmed = window.confirm("你是否要回退到当前版本？");
                          if (!confirmed) {
                            return;
                          }
                          try {
                            rollbackToMessage(message.id);
                          } catch (error) {
                            window.alert(error instanceof Error ? error.message : rollbackCopy.limitError);
                            return;
                          }
                          setRollbackMode(false);
                        }}
                      >
                        回退到这里
                      </button>
                    ) : null}
                    <time className="desktop-message-time">{formatTime(message.timestamp)}</time>
                  </div>

                  {message.role === "user" ? <span className="desktop-message-avatar user">我</span> : null}
                </article>
              );
                })}
              </>
            )}
          </div>

          {systemToast ? (
            <div key={systemToast.id} className="desktop-system-toast" role="status" aria-live="polite">
              <span className="desktop-system-toast-badge">系</span>
              <span className="desktop-system-toast-copy">{systemToast.displayedText}</span>
            </div>
          ) : null}

          {showExitDialog ? (
            <div className="desktop-overlay-backdrop" role="presentation" onClick={() => setShowExitDialog(false)}>
              <div
                className="desktop-exit-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="exit-dialog-title"
                onClick={(event) => event.stopPropagation()}
              >
                <h2 id="exit-dialog-title" className="desktop-exit-dialog-title">
                  {exitDialogTitle}
                </h2>
                <p className="desktop-exit-dialog-body">{exitDialogBody}</p>
                <div className="desktop-exit-dialog-actions">
                  <button
                    className="desktop-header-button"
                    type="button"
                    onClick={() => {
                      setShowExitDialog(false);
                      void exitAttempt();
                    }}
                  >
                    {exitCopy.confirmLabel}
                  </button>
                  <button
                    className="desktop-header-button"
                    type="button"
                    onClick={() => setShowExitDialog(false)}
                  >
                    {exitCopy.stayLabel}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {currentConversation.view !== "articles" ? (
            <footer className={`desktop-chat-composer disturbance-${disturbanceLevel}`}>
            <div className="desktop-composer-editor">
              <div
                className={`desktop-composer-input-wrap disturbance-${disturbanceLevel}${showComposerDisturbance ? " has-warning" : ""}`}
              >
                {showComposerDisturbance ? (
                  <div className={`desktop-composer-alert disturbance-${Math.max(disturbanceLevel, draftPauseLevel)}`}>
                    <strong>异常</strong>
                    <span>{composerWarning}</span>
                  </div>
                ) : null}
                {showComposerDisturbance ? (
                  <div className={`desktop-input-undercurrent disturbance-${Math.max(disturbanceLevel, draftPauseLevel)}`} aria-hidden="true">
                    <span>{disturbanceCopy || "你删掉的那句还在后面。"}</span>
                    <span>{disturbanceCopy || "你删掉的那句还在后面。"}</span>
                  </div>
                ) : null}
                <textarea
                  className="desktop-chat-input"
                  placeholder={`给${currentConversation.name}发消息`}
                  disabled={
                    currentConversation.id === "z"
                      ? session.stage === "location_reveal" || session.stage === "location_aftermath"
                      : mockReplyingConversationId === currentConversation.id
                  }
                  value={draft}
                  onKeyDown={handleInputKeyDown}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    const nativeEvent = event.nativeEvent as InputEvent;
                    const inputType = typeof nativeEvent.inputType === "string" ? nativeEvent.inputType : "";
                    const isDeleting =
                      inputType === "deleteContentBackward" || inputType === "deleteContentForward";

                    updateDraft(draft, nextValue, {
                      isDeleting,
                      deletionType:
                        inputType === "deleteContentBackward" || inputType === "deleteContentForward"
                          ? inputType
                          : "",
                      isComposing: Boolean(nativeEvent.isComposing)
                      ,
                      timestamp: Date.now()
                    });
                    setDraft(nextValue);
                  }}
                />
                <span className="desktop-enter-hint">Enter 发送</span>
                {currentConversation.id === "z" && draftWhisper ? (
                  <div className={`desktop-draft-whisper level-${draftPauseLevel}`}>
                    <span>{draftWhisper}</span>
                    {draftEditCount >= 2 ? <small>这一句已经被改了 {draftEditCount} 次。</small> : null}
                  </div>
                ) : null}
              </div>
              <button
                className="desktop-send-button"
                type="button"
                disabled={
                  currentConversation.id === "z"
                    ? session.stage === "location_reveal" || session.stage === "location_aftermath"
                    : mockReplyingConversationId === currentConversation.id
                }
                onClick={handleSend}
              >
                {currentConversation.id === "z"
                  ? "发送"
                  : mockReplyingConversationId === currentConversation.id
                    ? "发送中"
                    : "发送"}
              </button>
            </div>
            </footer>
          ) : null}
        </section>
      </section>
    </main>
  );
}
