import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { translateLoveLanguage } from "../../features/translator/translatorService";
import { llmClient } from "../../services/api/llmClient";
import { useAppStore } from "../../app/store/useAppStore";
import type { LoveTranslationReport } from "../../types/api";

export function TranslatorPage() {
  const navigate = useNavigate();
  const hasFinishedGame = useAppStore((state) => state.session.hasFinishedGame);
  const [chatText, setChatText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<LoveTranslationReport | null>(null);

  return (
    <main className="screen">
      <section className="shell page page-body stack">
        <p className="tiny">开发者 B 负责区域</p>
        <h2 className="hero-title">恋爱翻译官</h2>
        <p className="hero-subtitle">把一句嘴硬的话，翻译成它真正想表达的意思。</p>

        {!hasFinishedGame ? (
          <div className="card stack">
            <strong>尚未解锁</strong>
            <span className="meta-copy">按文档约定，翻译官会在梦醒后开放。你也可以先体验完整主链路再回来。</span>
          </div>
        ) : (
          <>
            <div className="card stack">
              <strong>当前模式</strong>
              <span className="meta-copy">
                {llmClient.isEnabled() ? "已检测到 LLM 配置，优先尝试在线翻译。" : "未检测到完整 LLM 配置，当前使用本地 mock 结果。"}
              </span>
            </div>

            <textarea
              className="chat-input"
              placeholder={"A: 你今天怎么这么晚回？\nB: 没事，你忙吧。"}
              value={chatText}
              onChange={(event) => setChatText(event.target.value)}
            />

            <button
              className="button-primary"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setError(null);

                try {
                  const nextReport = await translateLoveLanguage(chatText);
                  setReport(nextReport);
                } catch (caughtError) {
                  setReport(null);
                  setError(caughtError instanceof Error ? caughtError.message : "翻译失败，请稍后再试。");
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "翻译中..." : "开始翻译"}
            </button>

            {error ? <div className="card">{error}</div> : null}

            {report ? (
              <div className="stack">
                <div className="card">
                  <strong>原话</strong>
                  <p className="meta-copy">{report.original}</p>
                </div>
                <div className="card">
                  <strong>可能真实含义</strong>
                  <p className="meta-copy">{report.possibleMeaning}</p>
                </div>
                <div className="card">
                  <strong>尖锐翻译</strong>
                  <p className="meta-copy">{report.sharpTranslation}</p>
                </div>
                <div className="card">
                  <strong>更好的表达</strong>
                  <p className="meta-copy">{report.betterExpression}</p>
                </div>
                <div className="card">
                  <strong>实操建议</strong>
                  <p className="meta-copy">{report.actionAdvice}</p>
                </div>
              </div>
            ) : null}
          </>
        )}

        <div className="spacer" />
        <div className="stack">
          <button className="button-primary" onClick={() => navigate("/share")}>
            查看分享卡占位
          </button>
          <button className="button-secondary" onClick={() => navigate("/")}>
            返回开始页
          </button>
        </div>
      </section>
    </main>
  );
}
