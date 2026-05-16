import { Navigate, Route, Routes } from "react-router-dom";
import StartPage from "../../pages/StartPage";
import TranslatorPage from "../../pages/TranslatorPage";
import ShareCardPage from "../../pages/ShareCardPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/translator" element={<TranslatorPage />} />
      <Route path="/share" element={<ShareCardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
