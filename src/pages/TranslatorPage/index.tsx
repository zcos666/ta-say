import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useSessionStore } from "../../app/store/sessionStore";
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
      "radial-gradient(circle at top, rgba(59, 130, 246, 0.16), transparent 32%), #020617",
    color: "#e2e8f0",
  },
  shell: {
    width: "min(1120px, 100%)",
    margin: "0 auto",
    display: "grid",
    gap: 24,
  },
  hero: {
    display: "grid",
    gap: 12,
  },
  eyebrow: {
    margin: 0,
    color: "#f9a8d4",
    fontSize: 13,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    fontSize: "clamp(30px, 5vw, 48px)",
    lineHeight: 1.1,
  },
  description: {
    margin: 0,
    maxWidth: 720,
    color: "#cbd5e1",
    fontSize: 16,
    lineHeight: 1.7,
  },
  grid: {
    display: "grid",
    gap: 24,
    gridTemplateColumns: "minmax(0, 420px) minmax(0, 1fr)",
  },
  panel: {
    display: "grid",
    gap: 18,
    padding: 20,
    borderRadius: 24,
    background: "rgba(15, 23, 42, 0.86)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    boxShadow: "0 20px 48px rgba(2, 6, 23, 0.3)",
  },
  field: {
    display: "grid",
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: "#f8fafc",
  },
  hint: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.6,
    color: "#94a3b8",
  },
  textarea: {
    minHeight: 180,
    resize: "vertical",
    borderRadius: 18,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    background: "rgba(15, 23, 42, 0.72)",
    color: "#f8fafc",
    padding: 16,
    fontSize: 15,
    lineHeight: 1.7,
    fontFamily: "inherit",
  },
  pillGroup: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  pill: {
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    background: "rgba(15, 23, 42, 0.72)",
    color: "#cbd5e1",
    cursor: "pointer",
  },
  pillActive: {
    background: "rgba(236, 72, 153, 0.18)",
    color: "#fbcfe8",
    border: "1px solid rgba(244, 114, 182, 0.32)",
  },
  select: {
    width: "100%",
    borderRadius: 16,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    background: "rgba(15, 23, 42, 0.72)",
    color: "#f8fafc",
    padding: "12px 14px",
    fontSize: 15,
  },
  status: {
    padding: "12px 14px",
    borderRadius: 16,
    background: "rgba(56, 189, 248, 0.12)",
    color: "#bae6fd",
    fontSize: 13,
    lineHeight: 1.6,
  },
  error: {
    padding: "12px 14px",
    borderRadius: 16,
    background: "rgba(248, 113, 113, 0.12)",
    color: "#fecaca",
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
    borderRadius: 16,
    border: "none",
    background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "12px 18px",
    borderRadius: 16,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    background: "rgba(15, 23, 42, 0.72)",
    color: "#e2e8f0",
    fontSize: 15,
    cursor: "pointer",
  },
  tertiaryButton: {
    padding: "12px 18px",
    borderRadius: 16,
    border: "1px dashed rgba(244, 114, 182, 0.32)",
    background: "rgba(76, 29, 149, 0.16)",
    color: "#f5d0fe",
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
  const fearType = useSessionStore((state) => state.fearType);
  const taPronoun = useSessionStore((state) => state.taPronoun);
  const hardestSentence = useSessionStore((state) => state.hardestSentence);
  const endingType = useSessionStore((state) => state.endingType);
  const pollutionCount = useSessionStore((state) => state.pollutionCount);
  const deletedDraftCount = useSessionStore((state) => state.deletedDraftCount);
  const loadCount = useSessionStore((state) => state.loadCount);
  const hasFinishedGame = useSessionStore((state) => state.hasFinishedGame);
  const translatorReport = useSessionStore((state) => state.translatorReport);
  const shareCardData = useSessionStore((state) => state.shareCardData);
  const patchSession = useSessionStore((state) => state.patchSession);
  const saveTranslatorReport = useSessionStore((state) => state.saveTranslatorReport);
  const saveShareCardData = useSessionStore((state) => state.saveShareCardData);

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
          <p style={pageStyles.eyebrow}>Translator Console</p>
          <h1 style={pageStyles.title}>把没说出口的话，翻译成人话</h1>
          <p style={pageStyles.description}>
            输入一段对话，系统会先尝试调用翻译接口；若接口不可用，则自动降级到本地规则与默认分享短句，保证报告卡始终可生成。
          </p>
        </section>

        <section style={pageStyles.grid}>
          <form style={pageStyles.panel} onSubmit={handleSubmit}>
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
