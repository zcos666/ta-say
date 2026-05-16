import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../app/store/useAppStore";
import TranslationReportCard from "../../components/share/TranslationReportCard";
import { defaultMockChat } from "../../config/fallbacks";
import {
  FEAR_TYPE_OPTIONS,
  TA_PRONOUN_OPTIONS,
  translateConversation,
  type TranslateConversationResult,
} from "../../features/translator/translatorService";
import {
  voiceInputService,
  type VoiceInputPresetOption,
  type VoiceInputState,
} from "../../services/voice/voiceInputService";
import type { FearType, TaPronoun } from "../../types/api";

const pageStyles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "40px 20px 64px",
    background:
      "radial-gradient(circle at top right, rgba(107, 44, 55, 0.08), transparent 24%), linear-gradient(180deg, rgba(20, 26, 22, 0.04), transparent 260px), #eef1ee",
    color: "#1f1f1f",
  },
  shell: {
    width: "min(1120px, 100%)",
    margin: "0 auto",
    display: "grid",
    gap: 28,
  },
  hero: {
    display: "grid",
    gap: 14,
    padding: "26px 24px 24px",
    borderRadius: 28,
    background: "rgba(255, 255, 255, 0.84)",
    border: "1px solid rgba(214, 220, 214, 0.92)",
    boxShadow: "0 18px 44px rgba(24, 31, 24, 0.08)",
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
  title: {
    margin: 0,
    fontSize: "clamp(30px, 5vw, 48px)",
    lineHeight: 1.1,
  },
  description: {
    margin: 0,
    maxWidth: 720,
    color: "#5d655d",
    fontSize: 16,
    lineHeight: 1.7,
  },
  heroWarning: {
    width: "fit-content",
    maxWidth: "100%",
    padding: "12px 14px",
    borderRadius: 16,
    background: "linear-gradient(180deg, rgba(255,248,250,0.96) 0%, rgba(247,242,244,0.96) 100%)",
    border: "1px solid rgba(107, 44, 55, 0.14)",
    color: "#5f4b50",
    fontSize: 13,
    lineHeight: 1.7,
  },
  grid: {
    display: "grid",
    gap: 24,
    gridTemplateColumns: "minmax(0, 420px) minmax(0, 1fr)",
  },
  panel: {
    display: "grid",
    gap: 20,
    padding: 24,
    borderRadius: 28,
    background: "rgba(255, 255, 255, 0.98)",
    border: "1px solid rgba(214, 220, 214, 0.96)",
    boxShadow: "0 18px 44px rgba(24, 31, 24, 0.08)",
  },
  panelTitle: {
    margin: 0,
    fontSize: 18,
    lineHeight: 1.4,
  },
  panelIntro: {
    margin: 0,
    color: "#707870",
    fontSize: 13,
    lineHeight: 1.7,
  },
  field: {
    display: "grid",
    gap: 10,
    padding: 16,
    borderRadius: 20,
    background: "#f7f8f7",
    border: "1px solid rgba(226, 230, 226, 0.96)",
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
    color: "#7b837b",
  },
  textarea: {
    minHeight: 180,
    resize: "vertical",
    borderRadius: 18,
    border: "1px solid rgba(214, 220, 214, 0.96)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,251,250,0.98) 100%)",
    color: "#1f1f1f",
    padding: 16,
    fontSize: 15,
    lineHeight: 1.7,
    fontFamily: "inherit",
    boxShadow: "inset 0 1px 2px rgba(24, 31, 24, 0.04)",
  },
  pillGroup: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  pill: {
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(214, 220, 214, 0.96)",
    background: "#ffffff",
    color: "#5d655d",
    cursor: "pointer",
    transition: "all 160ms ease",
  },
  pillActive: {
    background: "rgba(233, 243, 237, 0.96)",
    color: "#234f3a",
    border: "1px solid rgba(47, 107, 79, 0.28)",
    boxShadow: "0 6px 18px rgba(47, 107, 79, 0.08)",
  },
  select: {
    width: "100%",
    borderRadius: 16,
    border: "1px solid rgba(214, 220, 214, 0.96)",
    background: "#ffffff",
    color: "#1f1f1f",
    padding: "12px 14px",
    fontSize: 15,
  },
  status: {
    padding: "12px 14px",
    borderRadius: 16,
    background: "rgba(243, 245, 243, 0.96)",
    border: "1px solid rgba(214, 220, 214, 0.96)",
    color: "#4d5750",
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
    padding: "12px 18px",
    borderRadius: 14,
    border: "1px solid rgba(47, 107, 79, 0.22)",
    background: "linear-gradient(180deg, #3b7c5a 0%, #2f6b4f 100%)",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(47, 107, 79, 0.18)",
  },
  secondaryButton: {
    padding: "12px 18px",
    borderRadius: 14,
    border: "1px solid rgba(214, 220, 214, 0.96)",
    background: "#ffffff",
    color: "#1f1f1f",
    fontSize: 15,
    cursor: "pointer",
  },
  tertiaryButton: {
    padding: "12px 18px",
    borderRadius: 14,
    border: "1px dashed rgba(107, 44, 55, 0.24)",
    background: "rgba(247, 243, 244, 0.96)",
    color: "#673340",
    fontSize: 15,
    cursor: "pointer",
  },
  aside: {
    display: "grid",
    gap: 18,
    alignContent: "start",
  },
  presetList: {
    display: "grid",
    gap: 10,
  },
};

function getInitialChatText(hardestSentence: string) {
  return hardestSentence?.trim() ? `A: 你还好吗？\nB: ${hardestSentence.trim()}` : defaultMockChat;
}

export default function TranslatorPage() {
  const fearType = useAppStore((state) => state.session.fearType);
  const taPronoun = useAppStore((state) => state.session.taPronoun);
  const hardestSentence = useAppStore((state) => state.session.hardestSentence);
  const endingType = useAppStore((state) => state.session.endingType);
  const pollutionCount = useAppStore((state) => state.session.pollutionCount);
  const deletedDraftCount = useAppStore((state) => state.session.deletedDraftCount);
  const loadCount = useAppStore((state) => state.session.loadCount);
  const hasFinishedGame = useAppStore((state) => state.session.hasFinishedGame);
  const translatorReport = useAppStore((state) => state.session.translatorReport);
  const shareCardData = useAppStore((state) => state.session.shareCardData);
  const patchSession = useAppStore((state) => state.patchSession);
  const saveTranslatorReport = useAppStore((state) => state.saveTranslatorReport);
  const saveShareCardData = useAppStore((state) => state.saveShareCardData);

  const [chatText, setChatText] = useState(() => getInitialChatText(hardestSentence));
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [latestResult, setLatestResult] = useState<TranslateConversationResult | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceInputState>(() => voiceInputService.getState());
  const [selectedPreset, setSelectedPreset] = useState<VoiceInputPresetOption | null>(null);

  const activeReport = latestResult?.report ?? translatorReport;
  const activeShareCardData = latestResult?.shareCardData ?? shareCardData;
  const statusNotices = latestResult?.notices ?? [];

  const summaryText = useMemo(() => {
    if (!activeShareCardData) {
      return "填入一段对话，系统会生成潜台词、直译与分享摘要。";
    }

    return `当前结局：${activeShareCardData.endingType}，分享短句已同步到报告卡，可直接复查最难说出口的那句话。`;
  }, [activeShareCardData]);

  useEffect(() => {
    const unsubscribe = voiceInputService.subscribe(setVoiceState);
    return () => {
      unsubscribe();
      voiceInputService.destroy();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!chatText.trim()) {
      setErrorMessage("请先输入一段需要翻译的对话。");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const result = await translateConversation({
        chatText,
        fearType,
        taPronoun,
        endingType,
        pollutionCount,
        deletedDraftCount,
        loadCount,
        hardestSentence,
        hasFinishedGame,
      });

      saveTranslatorReport(result.report);
      saveShareCardData(result.shareCardData);
      patchSession({
        hardestSentence: result.shareCardData.hardestSentence,
        stage: "share_ready",
      });
      setLatestResult(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "翻译失败，请稍后重试。";
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleFearTypeChange(nextFearType: FearType) {
    patchSession({ fearType: nextFearType });
  }

  function handlePronounChange(nextPronoun: TaPronoun) {
    patchSession({ taPronoun: nextPronoun });
  }

  function handleReset() {
    setChatText(getInitialChatText(hardestSentence));
    setLatestResult(null);
    setErrorMessage("");
    setSelectedPreset(null);
    voiceInputService.reset();
  }

  async function handleVoiceStart() {
    setErrorMessage("");

    try {
      const result = await voiceInputService.startListening();
      if (result.kind === "success") {
        setChatText((prev) => {
          const base = prev.trim() ? `${prev.trim()}\n` : "";
          return `${base}B: ${result.transcript}`;
        });
        setSelectedPreset(null);
      }

      if (result.kind === "fallback") {
        setSelectedPreset(result.options[0] ?? null);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "语音输入启动失败。");
    }
  }

  function handleUsePreset(option: VoiceInputPresetOption) {
    const result = voiceInputService.usePreset(option);
    setSelectedPreset(option);
    setChatText((prev) => {
      const base = prev.trim() ? `${prev.trim()}\n` : "";
      return `${base}B: ${result.transcript}`;
    });
  }

  return (
    <main style={pageStyles.page}>
      <div style={pageStyles.shell}>
        <section style={pageStyles.hero}>
          <div style={pageStyles.heroTopLine}>
            <p style={pageStyles.eyebrow}>Translator Console</p>
            <span style={pageStyles.heroBadge}>潜台词取证中</span>
          </div>
          <h1 style={pageStyles.title}>把没说出口的话，翻译成人话</h1>
          <p style={pageStyles.description}>
            像在整理一段聊天证物。系统会拆出潜台词、锋利直译和更好的表达，让那些被压低、撤回、假装没事的话重新显形。
          </p>
          <div style={pageStyles.heroWarning}>
            异常提示：有些句子表面是安静的，真正吓人的部分在它没有说出来的地方。
          </div>
        </section>

        <section style={pageStyles.grid}>
          <form style={pageStyles.panel} onSubmit={handleSubmit}>
            <div>
              <h2 style={pageStyles.panelTitle}>聊天样本</h2>
              <p style={pageStyles.panelIntro}>左侧录入聊天记录，右侧生成拆解报告与行动建议。</p>
            </div>
            <div style={pageStyles.field}>
              <label htmlFor="translator-chat" style={pageStyles.label}>
                对话内容
              </label>
              <p style={pageStyles.hint}>支持粘贴聊天记录，默认会抓取最后一句作为最难说出口的话。</p>
              <textarea
                id="translator-chat"
                value={chatText}
                onChange={(event) => setChatText(event.target.value)}
                placeholder={defaultMockChat}
                style={pageStyles.textarea}
              />
            </div>

            <div style={pageStyles.field}>
              <span style={pageStyles.label}>恐惧标签</span>
              <div style={pageStyles.pillGroup}>
                {FEAR_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    style={{
                      ...pageStyles.pill,
                      ...(fearType === option ? pageStyles.pillActive : undefined),
                    }}
                    onClick={() => handleFearTypeChange(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div style={pageStyles.field}>
              <label htmlFor="translator-pronoun" style={pageStyles.label}>
                对方代称
              </label>
              <select
                id="translator-pronoun"
                value={taPronoun ?? "TA"}
                onChange={(event) => handlePronounChange(event.target.value as TaPronoun)}
                style={pageStyles.select}
              >
                {TA_PRONOUN_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div style={pageStyles.status}>{summaryText}</div>

            <div style={pageStyles.field}>
              <span style={pageStyles.label}>语音输入</span>
              <p style={pageStyles.hint}>
                优先调用 Web Speech API；若浏览器不支持或权限被拒，会切换到预设文本降级。
              </p>
              <div style={pageStyles.buttonRow}>
                <button
                  type="button"
                  style={pageStyles.tertiaryButton}
                  onClick={handleVoiceStart}
                  disabled={voiceState.status === "checking" || voiceState.status === "listening"}
                >
                  {voiceState.status === "listening"
                    ? "正在收音..."
                    : voiceState.status === "checking"
                      ? "正在启动麦克风..."
                      : "开始语音输入"}
                </button>
                {voiceState.isListening ? (
                  <button
                    type="button"
                    style={pageStyles.secondaryButton}
                    onClick={() => voiceInputService.stopListening()}
                  >
                    结束收音
                  </button>
                ) : null}
              </div>
              {voiceState.errorMessage ? <div style={pageStyles.status}>{voiceState.errorMessage}</div> : null}
              {(voiceState.status === "fallback" || voiceState.status === "unsupported") &&
              voiceState.presetOptions.length > 0 ? (
                <div style={pageStyles.presetList}>
                  {voiceState.presetOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      style={{
                        ...pageStyles.secondaryButton,
                        ...(selectedPreset?.id === option.id ? pageStyles.pillActive : undefined),
                      }}
                      onClick={() => handleUsePreset(option)}
                    >
                      {option.label ?? option.text}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

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
                {submitting ? "翻译中..." : "生成翻译报告"}
              </button>
              <button type="button" style={pageStyles.secondaryButton} onClick={handleReset}>
                重置输入
              </button>
              <Link
                to="/share"
                style={{
                  ...pageStyles.secondaryButton,
                  display: "inline-flex",
                  alignItems: "center",
                  textDecoration: "none",
                }}
              >
                查看分享卡
              </Link>
            </div>
          </form>

          <aside style={pageStyles.aside}>
            <TranslationReportCard
              report={activeReport}
              shareCardData={activeShareCardData}
              conversationText={chatText}
              usedFallback={latestResult?.usedFallback ?? false}
              shareLineUsedFallback={latestResult?.shareLineUsedFallback ?? false}
              notices={statusNotices}
            />
          </aside>
        </section>
      </div>
    </main>
  );
}
