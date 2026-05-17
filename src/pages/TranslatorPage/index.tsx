import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/store/useAppStore";
import TranslationReportCard from "../../components/share/TranslationReportCard";
import {
  parseConversationText,
  SAMPLE_TRANSLATOR_CONVERSATION,
  translateConversation,
  type TranslateConversationResult,
} from "../../features/translator/translatorService";

const pageStyles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100dvh",
    padding: "clamp(16px, 4vw, 40px) clamp(14px, 4vw, 20px) calc(32px + env(safe-area-inset-bottom))",
    background:
      "radial-gradient(circle at 12% 0%, rgba(107, 44, 55, 0.12), transparent 22%), radial-gradient(circle at 100% 100%, rgba(23, 18, 21, 0.08), transparent 28%), linear-gradient(180deg, rgba(20, 26, 22, 0.08), transparent 260px), #ecefee",
    color: "#1f1f1f",
  },
  shell: {
    width: "min(1120px, 100%)",
    margin: "0 auto",
    display: "grid",
    gap: "clamp(18px, 3vw, 28px)",
    position: "relative",
  },
  hero: {
    display: "grid",
    gap: 14,
    padding: "clamp(18px, 4vw, 26px)",
    borderRadius: "clamp(20px, 4vw, 28px)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(248,243,245,0.84) 100%)",
    border: "1px solid rgba(160, 133, 142, 0.28)",
    boxShadow: "0 22px 54px rgba(34, 25, 29, 0.14)",
    backdropFilter: "blur(12px)",
  },
  heroTopLine: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  eyebrow: {
    margin: 0,
    display: "inline-flex",
    width: "fit-content",
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid rgba(30, 37, 33, 0.08)",
    background: "rgba(241, 243, 241, 0.96)",
    color: "#39423c",
    fontSize: 13,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  heroBadge: {
    display: "inline-flex",
    width: "fit-content",
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    letterSpacing: "0.04em",
    background: "rgba(107, 44, 55, 0.08)",
    border: "1px solid rgba(107, 44, 55, 0.16)",
    color: "#673340",
  },
  monitorPill: {
    display: "inline-flex",
    width: "fit-content",
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    letterSpacing: "0.08em",
    background: "rgba(32, 25, 29, 0.9)",
    border: "1px solid rgba(107, 44, 55, 0.22)",
    color: "#f7e9ed",
  },
  title: {
    margin: 0,
    fontSize: "clamp(30px, 5vw, 48px)",
    lineHeight: 1.1,
  },
  description: {
    margin: 0,
    maxWidth: 760,
    color: "#5d585c",
    fontSize: 16,
    lineHeight: 1.7,
  },
  warningStrip: {
    margin: 0,
    padding: "12px 14px",
    borderRadius: 16,
    background:
      "linear-gradient(180deg, rgba(36,28,32,0.96) 0%, rgba(57,39,46,0.96) 100%)",
    border: "1px solid rgba(107, 44, 55, 0.24)",
    color: "#f4dde4",
    fontSize: 13,
    lineHeight: 1.7,
    boxShadow: "0 14px 30px rgba(33, 24, 28, 0.18)",
  },
  grid: {
    display: "grid",
    gap: 24,
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
    alignItems: "start",
  },
  panel: {
    display: "grid",
    gap: 20,
    padding: "clamp(18px, 4vw, 24px)",
    borderRadius: "clamp(20px, 4vw, 28px)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,244,245,0.96) 100%)",
    border: "1px solid rgba(171, 148, 155, 0.2)",
    boxShadow: "0 20px 48px rgba(33, 24, 28, 0.12)",
  },
  panelTitle: {
    margin: 0,
    fontSize: 18,
    lineHeight: 1.4,
  },
  panelIntro: {
    margin: 0,
    color: "#70676b",
    fontSize: 13,
    lineHeight: 1.7,
  },
  field: {
    display: "grid",
    gap: 10,
    padding: "clamp(14px, 3vw, 16px)",
    borderRadius: "clamp(16px, 3vw, 20px)",
    background:
      "linear-gradient(180deg, rgba(250,249,249,0.98) 0%, rgba(245,242,244,0.96) 100%)",
    border: "1px solid rgba(183, 171, 176, 0.18)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1f1f1f",
  },
  hint: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.6,
    color: "#7a7276",
  },
  speakerGuide: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  speakerChip: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 32,
    padding: "0 12px",
    borderRadius: 999,
    background: "rgba(255, 255, 255, 0.94)",
    border: "1px solid rgba(176, 165, 170, 0.18)",
    color: "#5d585c",
    fontSize: 13,
  },
  textarea: {
    minHeight: "clamp(132px, 24vh, 180px)",
    resize: "vertical",
    borderRadius: "clamp(14px, 3vw, 18px)",
    border: "1px solid rgba(162, 143, 151, 0.24)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,245,246,0.98) 100%)",
    color: "#1f1f1f",
    padding: 16,
    fontSize: 15,
    lineHeight: 1.7,
    fontFamily: "inherit",
    boxShadow: "inset 0 1px 2px rgba(24, 31, 24, 0.04), inset 0 0 0 1px rgba(255,255,255,0.35)",
  },
  status: {
    padding: "12px 14px",
    borderRadius: 16,
    background: "rgba(247, 242, 244, 0.92)",
    border: "1px solid rgba(171, 148, 155, 0.16)",
    color: "#5a5156",
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
    border: "1px solid rgba(121, 86, 97, 0.22)",
    background: "linear-gradient(180deg, #916d79 0%, #795661 100%)",
    color: "#fffafc",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(121, 86, 97, 0.22)",
  },
  secondaryButton: {
    flex: "1 1 160px",
    padding: "12px 18px",
    borderRadius: 14,
    border: "1px solid rgba(214, 220, 214, 0.96)",
    background: "#ffffff",
    color: "#1f1f1f",
    fontSize: 15,
    cursor: "pointer",
  },
  aside: {
    display: "grid",
    gap: 18,
    alignContent: "start",
  },
  helperCard: {
    padding: "clamp(16px, 3vw, 18px)",
    borderRadius: "clamp(18px, 3vw, 22px)",
    background:
      "linear-gradient(180deg, rgba(34,27,31,0.96) 0%, rgba(53,39,45,0.96) 100%)",
    border: "1px solid rgba(107, 44, 55, 0.22)",
    boxShadow: "0 16px 34px rgba(24, 18, 21, 0.18)",
  },
  helperTitle: {
    margin: "0 0 8px",
    fontSize: 16,
    lineHeight: 1.4,
    color: "#f6e6eb",
  },
  helperBody: {
    margin: 0,
    color: "#d7c3ca",
    fontSize: 13,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
  },
  resultWindow: {
    display: "grid",
    gap: 12,
    padding: "clamp(16px, 3vw, 18px)",
    borderRadius: "clamp(18px, 3vw, 22px)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(247,241,243,0.96) 100%)",
    border: "1px solid rgba(107, 44, 55, 0.2)",
    boxShadow: "0 20px 42px rgba(45, 31, 36, 0.14)",
  },
  resultWindowHead: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  resultWindowDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#6b2c37",
    boxShadow: "0 0 0 6px rgba(107, 44, 55, 0.08)",
  },
  resultWindowTitle: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.3,
  },
  resultWindowBody: {
    margin: 0,
    color: "#564a4f",
    fontSize: 14,
    lineHeight: 1.7,
  },
  resultWindowStats: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  resultWindowStat: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 30,
    padding: "0 12px",
    borderRadius: 999,
    background: "rgba(248, 244, 245, 0.96)",
    border: "1px solid rgba(107, 44, 55, 0.1)",
    color: "#6a545b",
    fontSize: 12,
  },
  inputStats: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  inputStat: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 30,
    padding: "0 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(171, 148, 155, 0.18)",
    color: "#5d585c",
    fontSize: 12,
  },
  qualityCard: {
    display: "grid",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 16,
    background: "rgba(247, 242, 244, 0.72)",
    border: "1px solid rgba(171, 148, 155, 0.16)",
  },
  qualityTitle: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    color: "#4f4549",
  },
  qualityList: {
    margin: 0,
    paddingLeft: 18,
    display: "grid",
    gap: 6,
    color: "#5d585c",
    fontSize: 13,
    lineHeight: 1.6,
  },
  previewBox: {
    display: "grid",
    gap: 8,
    padding: "12px 14px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(171, 148, 155, 0.16)",
  },
  previewLine: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.6,
    color: "#5d585c",
    whiteSpace: "pre-wrap",
  },
} as const;

export default function TranslatorPage() {
  const navigate = useNavigate();
  const hardestSentence = useAppStore((state) => state.session.hardestSentence);
  const taPronoun = useAppStore((state) => state.session.taPronoun);
  const endingType = useAppStore((state) => state.session.endingType);
  const pollutionCount = useAppStore((state) => state.session.pollutionCount);
  const deletedDraftCount = useAppStore((state) => state.session.deletedDraftCount);
  const loadCount = useAppStore((state) => state.session.loadCount);
  const hasFinishedGame = useAppStore((state) => state.session.hasFinishedGame);
  const resetForReplay = useAppStore((state) => state.resetForReplay);
  const selectSetup = useAppStore((state) => state.selectSetup);
  const saveTranslatorReport = useAppStore((state) => state.saveTranslatorReport);
  const saveShareCardData = useAppStore((state) => state.saveShareCardData);

  const [conversationText, setConversationText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [latestResult, setLatestResult] = useState<TranslateConversationResult | null>(null);

  const activeReport = latestResult?.report ?? null;
  const statusNotices = latestResult?.notices ?? [];
  const liveInputSummary = useMemo(() => parseConversationText(conversationText), [conversationText]);
  const activeInputSummary = latestResult?.inputSummary ?? liveInputSummary;
  const previewTurns = activeInputSummary.turns.slice(0, 4);
  const inputChecklist = useMemo(() => {
    const items: string[] = [];
    items.push(activeInputSummary.mergedTurnCount >= 4 ? "轮次足够，适合做关系分析。" : "建议补到至少 4 轮以上关键对话。");
    items.push(activeInputSummary.selfCount > 0 && activeInputSummary.otherCount > 0 ? "双方都已识别，互动节奏比较清楚。" : "目前双方角色不够清楚，建议补上 `我:` 和 `TA:`。");
    items.push(activeInputSummary.unknownCount === 0 ? "说话人标注比较完整。" : `还有 ${activeInputSummary.unknownCount} 句未识别说话人。`);
    return items;
  }, [activeInputSummary]);
  const resultWindowSentence = hardestSentence?.trim() || "你这一轮留下了一些没说完的话。";
  const resultStats = [
    { label: "反义污染", value: pollutionCount },
    { label: "删除草稿", value: deletedDraftCount },
    { label: "读档失败", value: loadCount },
  ];

  const summaryText = useMemo(() => {
    if (!activeReport) {
      return "先粘贴一段聊天记录。系统会优先分析你们整体怎么聊天，而不是只拆一句话。";
    }

    return "右侧会根据当前输入，把这段关系拆成一份结构化报告。";
  }, [activeReport]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!conversationText.trim()) {
      setErrorMessage("请先填入聊天记录。");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const result = await translateConversation({
        conversationText,
        includeShareArtifacts: false,
        endingType,
        pollutionCount,
        deletedDraftCount,
        loadCount,
        hardestSentence,
        hasFinishedGame,
      });

      saveTranslatorReport(result.legacyReport);
      saveShareCardData(result.shareCardData);
      setLatestResult(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "翻译失败，请稍后重试。";
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setConversationText("");
    setLatestResult(null);
    setErrorMessage("");
  }

  return (
    <main style={pageStyles.page}>
      <div style={pageStyles.shell}>
        <section style={pageStyles.hero}>
          <div style={pageStyles.heroTopLine}>
            <p style={pageStyles.eyebrow}>Translator Console</p>
            <span style={pageStyles.heroBadge}>关系分析</span>
            <span style={pageStyles.monitorPill}>异常档案同步中</span>
          </div>
          <h1 style={pageStyles.title}>把一段聊天，翻译成一份关系报告</h1>
          <p style={pageStyles.description}>
            这里不再只翻一句话。你可以直接贴一段聊天记录，系统会尝试从整体节奏、表达模式和关键转折里，整理你们现在的关系状态。
          </p>
          <p style={pageStyles.warningStrip}>它会把梦里留下的对话和你后来补进去的聊天一起归档，所以有些东西会比你自己记得更完整。</p>
          <div style={pageStyles.buttonRow}>
            <button
              type="button"
              style={pageStyles.secondaryButton}
              onClick={async () => {
                resetForReplay();
                await selectSetup(taPronoun ?? "TA");
                navigate("/chat");
              }}
            >
              直接进入游戏
            </button>
            <button type="button" style={pageStyles.secondaryButton} onClick={() => navigate("/profiles")}>
              进入关系蒸馏台
            </button>
          </div>
        </section>

        <section style={pageStyles.grid}>
          <form style={pageStyles.panel} onSubmit={handleSubmit}>
            <div>
              <h2 style={pageStyles.panelTitle}>聊天记录输入区</h2>
              <p style={pageStyles.panelIntro}>直接粘贴一段聊天记录，重点是让系统看见你们怎么互动，而不是单独拆一句话。</p>
            </div>

            <div style={pageStyles.field}>
              <label htmlFor="translator-conversation" style={pageStyles.label}>
                你们的聊天记录
              </label>
              <p style={pageStyles.hint}>推荐直接用 `TA:` 和 `我:` 区分说话的人，尽量多给几轮关键聊天。</p>
              <div style={pageStyles.speakerGuide} aria-label="输入格式示例">
                <span style={pageStyles.speakerChip}>TA: 你先去，我马上出来</span>
                <span style={pageStyles.speakerChip}>我: 你呢</span>
                <span style={pageStyles.speakerChip}>我: 没事，你先忙吧</span>
              </div>
              <textarea
                id="translator-conversation"
                value={conversationText}
                onChange={(event) => setConversationText(event.target.value)}
                placeholder={"比如：\nTA: 你先去，我马上出来，刚上了个厕所\n我: 你呢\nTA: 马上\n我: 没事，你先忙吧"}
                style={pageStyles.textarea}
              />
              <div style={pageStyles.inputStats}>
                <span style={pageStyles.inputStat}>原始行数 {activeInputSummary.rawLineCount}</span>
                <span style={pageStyles.inputStat}>整理后轮次 {activeInputSummary.mergedTurnCount}</span>
                <span style={pageStyles.inputStat}>我 {activeInputSummary.selfCount}</span>
                <span style={pageStyles.inputStat}>TA {activeInputSummary.otherCount}</span>
                <span style={pageStyles.inputStat}>未识别 {activeInputSummary.unknownCount}</span>
              </div>
              <div style={pageStyles.qualityCard}>
                <p style={pageStyles.qualityTitle}>输入质量反馈</p>
                <ul style={pageStyles.qualityList}>
                  {inputChecklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              {previewTurns.length > 0 ? (
                <div style={pageStyles.previewBox}>
                  <p style={pageStyles.hint}>系统会先按下面这个整理后的版本来分析：</p>
                  {previewTurns.map((turn, index) => (
                    <p key={`${turn.speaker}-${index}-${turn.text}`} style={pageStyles.previewLine}>
                      {turn.speaker === "self" ? "我" : turn.speaker === "other" ? "TA" : "未标注"}: {turn.text}
                    </p>
                  ))}
                  {activeInputSummary.turns.length > previewTurns.length ? (
                    <p style={pageStyles.previewLine}>...</p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div style={pageStyles.status}>{summaryText}</div>

            {statusNotices.length > 0 ? (
              <div style={pageStyles.status}>
                {statusNotices.map((notice) => (
                  <div key={notice}>{notice}</div>
                ))}
              </div>
            ) : null}

            {errorMessage ? <div style={pageStyles.error}>{errorMessage}</div> : null}

            <div style={pageStyles.buttonRow}>
              <button type="submit" style={pageStyles.primaryButton} disabled={submitting}>
                {submitting ? "分析中..." : "开始分析"}
              </button>
              <button
                type="button"
                style={pageStyles.secondaryButton}
                onClick={() => {
                  setConversationText(SAMPLE_TRANSLATOR_CONVERSATION);
                  setLatestResult(null);
                  setErrorMessage("");
                }}
              >
                填入示例
              </button>
              <button type="button" style={pageStyles.secondaryButton} onClick={handleReset}>
                重置输入
              </button>
            </div>
          </form>

          <aside style={pageStyles.aside}>
            {hasFinishedGame ? (
              <section style={pageStyles.resultWindow} aria-label="结果卡入口">
                <div style={pageStyles.resultWindowHead}>
                  <span style={pageStyles.resultWindowDot} />
                  <h3 style={pageStyles.resultWindowTitle}>结果卡已生成</h3>
                </div>
                <p style={pageStyles.resultWindowBody}>这句留到了最后：{resultWindowSentence}</p>
                <p style={pageStyles.resultWindowBody}>梦里的主线聊天和你现在补进来的聊天记录，都会一起出现在结果卡里。</p>
                <div style={pageStyles.resultWindowStats}>
                  {resultStats.map((item) => (
                    <span key={item.label} style={pageStyles.resultWindowStat}>
                      {item.label} {item.value}
                    </span>
                  ))}
                </div>
                <button type="button" style={pageStyles.primaryButton} onClick={() => navigate("/share")}>
                  打开结果卡
                </button>
              </section>
            ) : null}
            <TranslationReportCard
              report={activeReport}
              conversationText={latestResult?.inputSummary.normalizedConversation ?? conversationText}
              usedFallback={latestResult?.usedFallback ?? false}
              notices={statusNotices}
            />
            <section style={pageStyles.helperCard}>
              <h3 style={pageStyles.helperTitle}>它最容易从哪里看穿你</h3>
              <p style={pageStyles.helperBody}>
                1. 不要只贴一句，尽量贴 4 到 10 轮关键聊天。
                {"\n"}2. 每句前面写 `TA:` 或 `我:`，系统更容易读懂互动节奏。
                {"\n"}3. 优先贴那些让你反复想、反复卡住的片段。
              </p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
