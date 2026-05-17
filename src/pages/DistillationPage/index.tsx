import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/store/useAppStore";
import { distillOtherProfile, distillSelfProfile } from "../../features/distillation";
import type { ChatMessage } from "../../types/session";
import type { OtherProfile, SelfProfile } from "../../types/distillation";

const pageStyles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100dvh",
    padding: "clamp(16px, 4vw, 40px) clamp(14px, 4vw, 20px) calc(32px + env(safe-area-inset-bottom))",
    background:
      "radial-gradient(circle at 12% 0%, rgba(57, 88, 72, 0.12), transparent 22%), radial-gradient(circle at 100% 100%, rgba(23, 18, 21, 0.08), transparent 28%), linear-gradient(180deg, rgba(20, 26, 22, 0.08), transparent 260px), #eef2ef",
    color: "#1f1f1f",
  },
  shell: {
    width: "min(1180px, 100%)",
    margin: "0 auto",
    display: "grid",
    gap: 24,
  },
  hero: {
    display: "grid",
    gap: 14,
    padding: "clamp(18px, 4vw, 28px)",
    borderRadius: "clamp(20px, 4vw, 28px)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(245,249,246,0.88) 100%)",
    border: "1px solid rgba(121, 150, 132, 0.22)",
    boxShadow: "0 22px 54px rgba(34, 25, 29, 0.1)",
  },
  eyebrow: {
    margin: 0,
    display: "inline-flex",
    width: "fit-content",
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(59, 92, 75, 0.09)",
    border: "1px solid rgba(59, 92, 75, 0.14)",
    color: "#355544",
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    fontSize: "clamp(30px, 5vw, 46px)",
    lineHeight: 1.1,
  },
  description: {
    margin: 0,
    maxWidth: 780,
    color: "#5b645e",
    fontSize: 16,
    lineHeight: 1.7,
  },
  grid: {
    display: "grid",
    gap: 24,
    gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)",
  },
  panel: {
    display: "grid",
    gap: 18,
    padding: "clamp(18px, 4vw, 24px)",
    borderRadius: 24,
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,251,249,0.96) 100%)",
    border: "1px solid rgba(171, 188, 177, 0.26)",
    boxShadow: "0 20px 44px rgba(33, 24, 28, 0.08)",
    alignContent: "start",
  },
  panelTitle: {
    margin: 0,
    fontSize: 18,
    lineHeight: 1.4,
  },
  panelIntro: {
    margin: 0,
    color: "#6c746f",
    fontSize: 13,
    lineHeight: 1.7,
  },
  field: {
    display: "grid",
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
  },
  hint: {
    margin: 0,
    color: "#77807a",
    fontSize: 13,
    lineHeight: 1.6,
  },
  textarea: {
    minHeight: "clamp(220px, 36vh, 420px)",
    resize: "vertical",
    borderRadius: 18,
    border: "1px solid rgba(162, 174, 166, 0.28)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,250,248,0.98) 100%)",
    color: "#1f1f1f",
    padding: 16,
    fontSize: 15,
    lineHeight: 1.7,
    fontFamily: "inherit",
  },
  status: {
    padding: "12px 14px",
    borderRadius: 16,
    background: "rgba(244, 248, 245, 0.96)",
    border: "1px solid rgba(164, 184, 170, 0.18)",
    color: "#56615a",
    fontSize: 13,
    lineHeight: 1.6,
  },
  error: {
    padding: "12px 14px",
    borderRadius: 16,
    background: "rgba(255, 241, 241, 0.96)",
    color: "#bf5d5d",
    fontSize: 13,
    lineHeight: 1.6,
  },
  buttonRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  primaryButton: {
    flex: "1 1 180px",
    padding: "12px 18px",
    borderRadius: 14,
    border: "1px solid rgba(74, 109, 89, 0.22)",
    background: "linear-gradient(180deg, #61816d 0%, #496454 100%)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(73, 100, 84, 0.18)",
  },
  secondaryButton: {
    flex: "1 1 150px",
    padding: "12px 18px",
    borderRadius: 14,
    border: "1px solid rgba(214, 220, 214, 0.96)",
    background: "#fff",
    color: "#1f1f1f",
    fontSize: 15,
    cursor: "pointer",
  },
  results: {
    display: "grid",
    gap: 16,
  },
  profileCard: {
    display: "grid",
    gap: 14,
    padding: "18px",
    borderRadius: 20,
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,249,247,0.96) 100%)",
    border: "1px solid rgba(156, 177, 164, 0.22)",
  },
  profileTitle: {
    margin: 0,
    fontSize: 17,
  },
  profileSummary: {
    margin: 0,
    color: "#49524c",
    fontSize: 14,
    lineHeight: 1.7,
  },
  group: {
    display: "grid",
    gap: 8,
  },
  groupTitle: {
    margin: 0,
    fontSize: 13,
    letterSpacing: "0.04em",
    color: "#5c675f",
    textTransform: "uppercase",
  },
  chips: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 30,
    padding: "0 12px",
    borderRadius: 999,
    background: "rgba(237, 243, 239, 0.96)",
    border: "1px solid rgba(156, 177, 164, 0.2)",
    color: "#476051",
    fontSize: 12,
  },
  evidenceList: {
    margin: 0,
    paddingLeft: 18,
    display: "grid",
    gap: 8,
    color: "#4d5651",
    fontSize: 14,
    lineHeight: 1.7,
  },
} as const;

function buildConversationDraft(chatHistory: ChatMessage[]) {
  const draft = chatHistory
    .filter((message) => message.role === "user" || message.role === "ta")
    .map((message) => {
      const label = message.role === "user" ? "我" : "TA";
      const content = (message.originalText || message.displayedText || "").trim();
      return content ? `${label}: ${content}` : "";
    })
    .filter(Boolean)
    .join("\n");

  return draft;
}

function renderChips(items: string[]) {
  if (items.length === 0) {
    return <div style={pageStyles.hint}>暂无稳定标签。</div>;
  }

  return (
    <div style={pageStyles.chips}>
      {items.map((item) => (
        <span key={item} style={pageStyles.chip}>
          {item}
        </span>
      ))}
    </div>
  );
}

function ProfileBlock({
  title,
  profile,
}: {
  title: string;
  profile?: SelfProfile | OtherProfile;
}) {
  if (!profile) {
    return (
      <section style={pageStyles.profileCard}>
        <h3 style={pageStyles.profileTitle}>{title}</h3>
        <p style={pageStyles.hint}>还没有生成这份画像。</p>
      </section>
    );
  }

  return (
    <section style={pageStyles.profileCard}>
      <h3 style={pageStyles.profileTitle}>{title}</h3>
      <p style={pageStyles.profileSummary}>{profile.summary}</p>

      <div style={pageStyles.group}>
        <h4 style={pageStyles.groupTitle}>表达风格</h4>
        {renderChips(profile.styleTags)}
      </div>

      <div style={pageStyles.group}>
        <h4 style={pageStyles.groupTitle}>情绪表达</h4>
        {renderChips(profile.emotionalTraits)}
      </div>

      <div style={pageStyles.group}>
        <h4 style={pageStyles.groupTitle}>沟通习惯</h4>
        {renderChips(profile.communicationHabits)}
      </div>

      <div style={pageStyles.group}>
        <h4 style={pageStyles.groupTitle}>互动偏好</h4>
        {renderChips(profile.interactionPreferences)}
      </div>

      <div style={pageStyles.group}>
        <h4 style={pageStyles.groupTitle}>关系信号</h4>
        {renderChips(profile.relationshipSignals)}
      </div>

      <div style={pageStyles.group}>
        <h4 style={pageStyles.groupTitle}>证据片段</h4>
        {profile.evidence.length > 0 ? (
          <ul style={pageStyles.evidenceList}>
            {profile.evidence.map((item) => (
              <li key={`${item.quote}-${item.reason}`}>
                <strong>{item.quote}</strong>
                {" - "}
                {item.reason}
              </li>
            ))}
          </ul>
        ) : (
          <div style={pageStyles.hint}>这次没有提炼出稳定证据。</div>
        )}
      </div>
    </section>
  );
}

export default function DistillationPage() {
  const navigate = useNavigate();
  const chatHistory = useAppStore((state) => state.session.chatHistory);
  const storedSelfProfile = useAppStore((state) => state.session.selfProfile);
  const storedOtherProfile = useAppStore((state) => state.session.otherProfile);
  const saveDistilledProfiles = useAppStore((state) => state.saveDistilledProfiles);

  const [conversationText, setConversationText] = useState(() => buildConversationDraft(chatHistory));
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("把聊天记录贴进来后，系统会同时蒸馏你和对方的画像。");
  const [latestProfiles, setLatestProfiles] = useState<{
    selfProfile?: SelfProfile;
    otherProfile?: OtherProfile;
  }>({});

  const activeSelfProfile = latestProfiles.selfProfile ?? storedSelfProfile;
  const activeOtherProfile = latestProfiles.otherProfile ?? storedOtherProfile;

  const conversationStats = useMemo(() => {
    const lines = conversationText.split("\n").map((line) => line.trim()).filter(Boolean);
    return {
      totalLines: lines.length,
      selfLines: lines.filter((line) => /^我[:：]/.test(line)).length,
      otherLines: lines.filter((line) => /^(TA|他|她|对方)[:：]/i.test(line)).length,
    };
  }, [conversationText]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!conversationText.trim()) {
      setErrorMessage("请先填入聊天记录。");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setStatusMessage("正在蒸馏双方画像...");

    const results = await Promise.allSettled([
      distillSelfProfile({ conversation: conversationText }),
      distillOtherProfile({ conversation: conversationText }),
    ]);

    const nextProfiles: {
      selfProfile?: SelfProfile;
      otherProfile?: OtherProfile;
    } = {};

    if (results[0].status === "fulfilled") {
      nextProfiles.selfProfile = results[0].value;
    }
    if (results[1].status === "fulfilled") {
      nextProfiles.otherProfile = results[1].value;
    }

    if (nextProfiles.selfProfile || nextProfiles.otherProfile) {
      saveDistilledProfiles(nextProfiles);
      setLatestProfiles(nextProfiles);
    }

    const rejected = results.filter((result) => result.status === "rejected");
    if (rejected.length === 2) {
      const reason = rejected[0].reason;
      setErrorMessage(reason instanceof Error ? reason.message : "蒸馏失败，请稍后重试。");
      setStatusMessage("这次没有拿到有效画像。");
      setSubmitting(false);
      return;
    }

    if (rejected.length > 0) {
      const reason = rejected[0].reason;
      setErrorMessage(reason instanceof Error ? `部分画像生成失败：${reason.message}` : "部分画像生成失败。");
      setStatusMessage("已保存成功生成的那部分画像。");
      setSubmitting(false);
      return;
    }

    setStatusMessage("两份画像都已更新，可以直接用于后续联调。");
    setSubmitting(false);
  }

  function handleFillFromSession() {
    setConversationText(buildConversationDraft(chatHistory));
    setErrorMessage("");
    setStatusMessage("已把当前游戏里的聊天记录填进输入框。");
  }

  return (
    <main style={pageStyles.page}>
      <div style={pageStyles.shell}>
        <section style={pageStyles.hero}>
          <p style={pageStyles.eyebrow}>Distillation Console</p>
          <h1 style={pageStyles.title}>把聊天关系蒸成两份可复用画像</h1>
          <p style={pageStyles.description}>
            这条链路会从同一段聊天记录里，同时提炼 `self` 和 `other` 的结构化画像，供后续翻译器联动、模拟对话和长期记忆能力复用。
          </p>
        </section>

        <section style={pageStyles.grid}>
          <form style={pageStyles.panel} onSubmit={handleSubmit}>
            <div>
              <h2 style={pageStyles.panelTitle}>蒸馏输入区</h2>
              <p style={pageStyles.panelIntro}>推荐一行一条消息，按 `我:` / `TA:` 区分说话人。</p>
            </div>

            <div style={pageStyles.field}>
              <label htmlFor="distillation-conversation" style={pageStyles.label}>
                聊天记录
              </label>
              <p style={pageStyles.hint}>系统会先做输入标准化，再分别蒸馏双方画像。</p>
              <textarea
                id="distillation-conversation"
                value={conversationText}
                onChange={(event) => setConversationText(event.target.value)}
                placeholder={"我: 其实我有点在意\nTA: 那你刚刚为什么不说\n我: 我怕说了显得太黏"}
                style={pageStyles.textarea}
              />
            </div>

            <div style={pageStyles.status}>
              当前共 {conversationStats.totalLines} 行，其中 `self` {conversationStats.selfLines} 行，`other` {conversationStats.otherLines} 行。
            </div>
            <div style={pageStyles.status}>{statusMessage}</div>
            {errorMessage ? <div style={pageStyles.error}>{errorMessage}</div> : null}

            <div style={pageStyles.buttonRow}>
              <button type="submit" style={pageStyles.primaryButton} disabled={submitting}>
                {submitting ? "蒸馏中..." : "开始蒸馏"}
              </button>
              <button type="button" style={pageStyles.secondaryButton} onClick={handleFillFromSession}>
                载入当前聊天
              </button>
              <button type="button" style={pageStyles.secondaryButton} onClick={() => navigate("/translator")}>
                返回翻译器
              </button>
            </div>
          </form>

          <aside style={pageStyles.results}>
            <ProfileBlock title="蒸馏自己 / Self Profile" profile={activeSelfProfile} />
            <ProfileBlock title="蒸馏别人 / Other Profile" profile={activeOtherProfile} />
          </aside>
        </section>
      </div>
    </main>
  );
}
