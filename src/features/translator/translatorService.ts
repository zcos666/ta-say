import { defaultMockChat, shareLineFallbacks, translatorFallbacks } from "../../config/fallbacks";
import { buildHardcodedTranslationReport, findBestSubtextMapping } from "../../config/subtextMappings";
import { llmClient } from "../../services/api/llmClient";
import type { LoveTranslationReport, TaPronoun } from "../../types/api";
import type { ShareCardData } from "../../types/session";

export const TA_PRONOUN_OPTIONS: TaPronoun[] = ["他", "她", "TA"];

export interface TranslateConversationInput {
  chatText: string;
  taPronoun: TaPronoun | null;
  endingType: string | null;
  pollutionCount: number;
  deletedDraftCount: number;
  loadCount: number;
  hardestSentence: string;
  hasFinishedGame: boolean;
}

export interface TranslateConversationResult {
  report: LoveTranslationReport;
  shareCardData: ShareCardData;
  usedFallback: boolean;
  shareLineUsedFallback: boolean;
  notices: string[];
}

type ReportBuildResult = {
  report: LoveTranslationReport;
  usedFallback: boolean;
  notice?: string;
};

const GENERIC_SHARE_LINE = "接口临时离线，但你已经比刚才更接近真话。";

function normalizeText(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

function extractOriginalSentence(chatText: string) {
  const lines = normalizeText(chatText)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const fallbackLines = defaultMockChat.split("\n");
  const lastLine =
    lines[lines.length - 1] ??
    fallbackLines[fallbackLines.length - 1] ??
    "没事，你忙吧。";

  return lastLine.replace(/^[^:：]{0,8}[:：]\s*/, "").trim() || lastLine;
}

function sanitizeField(value: string | undefined, fallback: string) {
  const nextValue = value?.trim();
  return nextValue && nextValue.length > 0 ? nextValue : fallback;
}

function sanitizeReport(report: LoveTranslationReport, original: string): LoveTranslationReport {
  return {
    original: sanitizeField(report.original, original),
    possibleMeaning: sanitizeField(report.possibleMeaning, "你看似在退让，实际是在保护还没说出口的情绪。"),
    sharpTranslation: sanitizeField(report.sharpTranslation, "你不是没感觉，只是暂时不敢把真实需求摆到台面上。"),
    betterExpression: sanitizeField(report.betterExpression, "把你真正的感受和希望具体说出来，会比让对方猜安全得多。"),
    actionAdvice: sanitizeField(report.actionAdvice, "先描述事实，再说感受和期待，能显著减少误读。"),
  };
}

function buildGenericFallbackReport(chatText: string, taPronoun: TaPronoun | null) {
  const original = extractOriginalSentence(chatText);
  const pronoun = taPronoun ?? "TA";

  return sanitizeReport(
    {
      original,
      possibleMeaning: "你不是没感觉，你只是先把真正的情绪压低，想等一个更安全的时机再说。",
      sharpTranslation: "你把在意说轻，不是因为无所谓，而是因为怕认真以后更难收场。",
      betterExpression: `其实这件事让我有点难受。我刚刚没有直接说，是因为我怕气氛变僵，但我还是想让${pronoun}知道我的真实感受。`,
      actionAdvice: "先说感受，再说你希望对方怎么回应。比起让对方猜，短而直接的话更容易被接住。",
    },
    original,
  );
}

function findFallbackReport(chatText: string) {
  const original = extractOriginalSentence(chatText);

  const matchedEntry = translatorFallbacks.find((entry) =>
    entry.match.some((pattern) => pattern.test(chatText)),
  );

  if (matchedEntry) {
    return sanitizeReport({ ...matchedEntry.report, original }, original);
  }

  return undefined;
}

function findHardcodedReport(chatText: string, taPronoun: TaPronoun | null) {
  const original = extractOriginalSentence(chatText);
  const matched = findBestSubtextMapping(original);

  if (!matched) {
    return undefined;
  }

  return sanitizeReport(buildHardcodedTranslationReport(original, matched, taPronoun), original);
}

function resolveLocalReport(
  chatText: string,
  taPronoun: TaPronoun | null,
  notice?: string,
): ReportBuildResult {
  const matchedFallback = findFallbackReport(chatText);

  return {
    report: matchedFallback ?? buildGenericFallbackReport(chatText, taPronoun),
    usedFallback: true,
    notice,
  };
}

async function resolveRemoteReport(
  chatText: string,
  taPronoun: TaPronoun | null,
): Promise<ReportBuildResult> {
  const hardcodedReport = findHardcodedReport(chatText, taPronoun);
  if (hardcodedReport) {
    return {
      report: hardcodedReport,
      usedFallback: false
    };
  }

  try {
    const report = await llmClient.loveTranslate(chatText, {
      taPronoun,
    });

    if (!report) {
      return resolveLocalReport(
        chatText,
        taPronoun,
        "未检测到可用的大模型配置，已切换本地解读。",
      );
    }

    return {
      report: sanitizeReport(report, extractOriginalSentence(chatText)),
      usedFallback: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "翻译大模型异常";

    return resolveLocalReport(
      chatText,
      taPronoun,
      `翻译大模型暂时不可用，已切换本地解读：${message}`,
    );
  }
}

function buildLocalShareLine(endingType: string | null) {
  return shareLineFallbacks[endingType ?? ""] ?? GENERIC_SHARE_LINE;
}

async function resolveShareLine(
  endingType: string | null,
  hardestSentence: string,
  pollutionCount: number,
  deletedDraftCount: number,
  loadCount: number,
) {
  try {
    const response = await llmClient.shareLine({
      endingType: endingType ?? "梦醒翻译家",
      hardestSentence,
      pollutionCount,
      deletedCount: deletedDraftCount,
      loadCount,
    });

    if (!response) {
      return {
        shareLine: buildLocalShareLine(endingType),
        usedFallback: true,
        notice: "未检测到可用的大模型配置，已改用本地短句。",
      };
    }

    return {
      shareLine: sanitizeField(response.shareLine, buildLocalShareLine(endingType)),
      usedFallback: false,
      notice: undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "分享文案大模型异常";

    return {
      shareLine: buildLocalShareLine(endingType),
      usedFallback: true,
      notice: `分享文案大模型暂时不可用，已改用本地短句：${message}`,
    };
  }
}

function buildShareCardData(
  input: TranslateConversationInput,
  report: LoveTranslationReport,
  shareLine: string,
): ShareCardData {
  return {
    endingType: input.endingType ?? "梦醒翻译家",
    hardestSentence: extractOriginalSentence(input.hardestSentence || report.original || input.chatText),
    shareLine,
    pollutionCount: input.pollutionCount,
    deletedDraftCount: input.deletedDraftCount,
    loadCount: input.loadCount,
    aiTranslation: report.sharpTranslation,
  };
}

export async function translateLoveLanguage(chatText: string): Promise<LoveTranslationReport> {
  const normalized = normalizeText(chatText);
  const hardcodedReport = findHardcodedReport(normalized, null);
  if (hardcodedReport) {
    return hardcodedReport;
  }

  if (normalized.length < 4) {
    throw new Error("输入太短，至少给我一句完整对话。");
  }

  try {
    const llmReport = await llmClient.loveTranslate(normalized);
    if (llmReport) {
      return sanitizeReport(llmReport, extractOriginalSentence(normalized));
    }
  } catch {
    // Fall through to the local fallback path.
  }

  const reportResult = await resolveRemoteReport(normalized, null, null);
  return reportResult.report;
}

export async function translateConversation(
  input: TranslateConversationInput,
): Promise<TranslateConversationResult> {
  const chatText = normalizeText(input.chatText) || defaultMockChat;
  const originalSentence = extractOriginalSentence(chatText);
  const [reportResult, shareLineResult] = await Promise.all([
    resolveRemoteReport(chatText, input.taPronoun),
    resolveShareLine(
      input.endingType,
      originalSentence,
      input.pollutionCount,
      input.deletedDraftCount,
      input.loadCount,
    )
  ]);

  const notices = [reportResult.notice, shareLineResult.notice].filter(
    (notice): notice is string => Boolean(notice),
  );

  return {
    report: reportResult.report,
    shareCardData: buildShareCardData(
      {
        ...input,
        chatText,
        hardestSentence: originalSentence,
      },
      reportResult.report,
      shareLineResult.shareLine,
    ),
    usedFallback: reportResult.usedFallback,
    shareLineUsedFallback: shareLineResult.usedFallback,
    notices,
  };
}
