import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAppStore } from "./app/store/useAppStore";
import { ChatPage } from "./pages/ChatPage/ChatPage";
import { ShareCardPage } from "./pages/ShareCardPage/ShareCardPage";
import { SpacePage } from "./pages/SpacePage/SpacePage";
import { StartPage } from "./pages/StartPage/StartPage";
import { TranslatorPage } from "./pages/TranslatorPage/TranslatorPage";
import { TruthPage } from "./pages/TruthPage/TruthPage";
import { WakePage } from "./pages/WakePage/WakePage";

export default function App() {
  const hydrate = useAppStore((state) => state.hydrate);
  const hydrated = useAppStore((state) => state.hydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return <div className="screen shell">正在读取记忆...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/space" element={<SpacePage />} />
      <Route path="/truth" element={<TruthPage />} />
      <Route path="/wake" element={<WakePage />} />
      <Route path="/translator" element={<TranslatorPage />} />
      <Route path="/share" element={<ShareCardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
