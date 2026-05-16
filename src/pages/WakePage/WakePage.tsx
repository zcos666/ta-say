import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/store/useAppStore";
import { wakeLines } from "../../features/story/stageConfig";

export function WakePage() {
  const navigate = useNavigate();
  const finishWakeUp = useAppStore((state) => state.finishWakeUp);

  useEffect(() => {
    finishWakeUp();
  }, [finishWakeUp]);

  return (
    <main className="screen">
      <section className="shell page page-body stack">
        <p className="tiny">梦醒页</p>
        {wakeLines.map((line) => (
          <div key={line} className="card">
            {line}
          </div>
        ))}
        <p className="meta-copy">这轮 Meta 主链路已完成，首页现在会开放“进入恋爱翻译官”的入口。</p>
        <div className="spacer" />
        <div className="stack">
          <button className="button-primary" onClick={() => navigate("/translator")}>
            查看恋爱翻译官入口
          </button>
          <button className="button-secondary" onClick={() => navigate("/")}>
            返回开始页
          </button>
        </div>
      </section>
    </main>
  );
}
