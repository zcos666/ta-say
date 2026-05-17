import { defaultMockChat, shareLineFallbacks, translatorFallbacks } from "../../config/fallbacks";
import { llmClient } from "../../services/api/llmClient";
import type { LoveTranslationReport } from "../../types/api";
import type { ShareCardData } from "../../types/session";

export interface TranslateConversationInput {
  targetText: string;
  contextText?: string;
  includeShareArtifacts?: boolean;
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

function extractOriginalSentence(targetText: string, contextText = "") {
  const normalizedTarget = normalizeText(targetText);

  if (normalizedTarget) {
    return normalizedTarget.replace(/^[^:：]{0,8}[:：]\s*/, "").trim() || normalizedTarget;
  }

  const lines = normalizeText(contextText)
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

function buildTranslatePayload(targetText: string, contextText = "") {
  const target = normalizeText(targetText);
  const context = normalizeText(contextText);

  if (!context) {
    return target || defaultMockChat;
  }

  return [`【想翻译的句子】`, target || extractOriginalSentence("", context), "", `【聊天上下文】`, context].join("\n");
}

function buildGenericFallbackReport(targetText: string, contextText = "") {
  const original = extractOriginalSentence(targetText, contextText);

  return sanitizeReport(
    {
      original,
      possibleMeaning: "你不是没感觉，你只是先把真正的情绪压低，想等一个更安全的时机再说。",
      sharpTranslation: "你把在意说轻，不是因为无所谓，而是因为怕认真以后更难收场。",
      betterExpression: "其实这件事让我有点难受。我刚刚没有直接说，是因为我怕气氛变僵，但我还是想把真实感受说清楚。",
      actionAdvice: "先说感受，再说你希望对方怎么回应。比起让对方猜，短而直接的话更容易被接住。",
    },
    original,
  );
}

function findFallbackReport(targetText: string, contextText = "") {
  const original = extractOriginalSentence(targetText, contextText);
  const combinedText = [targetText, contextText].filter(Boolean).join("\n");

  const matchedEntry = translatorFallbacks.find((entry) =>
    entry.match.some((pattern) => pattern.test(combinedText)),
  );

  if (matchedEntry) {
    return sanitizeReport({ ...matchedEntry.report, original }, original);
  }

  return undefined;
}

function resolveLocalReport(
  targetText: string,
  contextText = "",
  notice?: string,
): ReportBuildResult {
  const matchedFallback = findFallbackReport(targetText, contextText);

  return {
    report: matchedFallback ?? buildGenericFallbackReport(targetText, contextText),
    usedFallback: true,
    notice,
  };
}

async function resolveRemoteReport(
  targetText: string,
  contextText = "",
): Promise<ReportBuildResult> {
  const payload = buildTranslatePayload(targetText, contextText);

  try {
    const report = await llmClient.loveTranslate(payload);

    if (!report) {
      return resolveLocalReport(
        targetText,
        contextText,
        "未检测到可用的大模型配置，已切换本地解读。",
      );
    }

    return {
      report: sanitizeReport(report, extractOriginalSentence(targetText, contextText)),
      usedFallback: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "翻译大模型异常";

    return resolveLocalReport(
      targetText,
      contextText,
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
  const originalSentence = extractOriginalSentence(input.targetText, input.contextText ?? "");
  return {
    endingType: input.endingType ?? "梦醒翻译家",
    hardestSentence: originalSentence,
    shareLine,
    pollutionCount: input.pollutionCount,
    deletedDraftCount: input.deletedDraftCount,
    loadCount: input.loadCount,
    aiTranslation: report.sharpTranslation,
    dreamReferenceText: sanitizeField(input.hardestSentence, originalSentence),
    translatorContextText: sanitizeField(input.contextText, ""),
  };
}

export async function translateLoveLanguage(chatText: string): Promise<LoveTranslationReport> {
  const normalized = normalizeText(chatText);

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

  const reportResult = await resolveRemoteReport(normalized, "");
  return reportResult.report;
}

export async function translateConversation(
  input: TranslateConversationInput,
): Promise<TranslateConversationResult> {
  const targetText = normalizeText(input.targetText);
  const contextText = normalizeText(input.contextText ?? "");

  if (!targetText) {
    throw new Error("请先填入你想翻译的那一句。");
  }

  const originalSentence = extractOriginalSentence(targetText, contextText);
  const reportResult = await resolveRemoteReport(targetText, contextText);
  const shareLineResult = input.includeShareArtifacts === false
    ? {
        shareLine: buildLocalShareLine(input.endingType),
        usedFallback: true,
        notice: undefined,
      }
    : await resolveShareLine(
        input.endingType,
        originalSentence,
        input.pollutionCount,
        input.deletedDraftCount,
        input.loadCount,
      );

  const notices = [reportResult.notice, shareLineResult.notice].filter(
    (notice): notice is string => Boolean(notice),
  );

  return {
    report: reportResult.report,
    shareCardData: buildShareCardData(
      {
        ...input,
        targetText,
        contextText,
      },
      reportResult.report,
      shareLineResult.shareLine,
    ),
    usedFallback: reportResult.usedFallback,
    shareLineUsedFallback: shareLineResult.usedFallback,
    notices,
  };
}
