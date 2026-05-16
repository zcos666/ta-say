import { llmClient } from "../../services/api/llmClient";
import type { LoveTranslationReport } from "../../types/api";

function pickOriginal(chatText: string) {
  const lines = chatText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines[lines.length - 1] ?? chatText.trim();
}

function createMockReport(chatText: string): LoveTranslationReport {
  const original = pickOriginal(chatText);

  return {
    original,
    possibleMeaning: "我没有真的不在乎，我只是先把情绪说轻一点，避免显得自己太需要回应。",
    sharpTranslation: "我在意，只是我不想把失落说得那么明显。",
    betterExpression: "我其实有点失落，如果你忙完能回我一下，我会安心很多。",
    actionAdvice: "把感受和期待拆开说，少用“没事”“都行”这类防御性表达。"
  };
}

export async function translateLoveLanguage(chatText: string): Promise<LoveTranslationReport> {
  const normalized = chatText.trim();

  if (normalized.length < 4) {
    throw new Error("输入太短，至少给我一句完整对话。");
  }

  const llmReport = await llmClient.loveTranslate(normalized);

  return llmReport ?? createMockReport(normalized);
}
