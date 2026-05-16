import { defaultMockChat, shareLineFallbacks, translatorFallbacks } from "../../config/fallbacks";
import { llmClient } from "../../services/api/llmClient";
import type { FearType, LoveTranslationReport, TaPronoun } from "../../types/api";
import type { ShareCardData } from "../../types/session";

export const FEAR_TYPE_OPTIONS: FearType[] = ["害怕被抛下", "害怕被控制", "害怕说真话"];
export const TA_PRONOUN_OPTIONS: TaPronoun[] = ["他", "她", "TA"];

export interface TranslateConversationInput {
  chatText: string;
  fearType: FearType | null;
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

const fearProfiles: Record<
  FearType,
  {
    possibleMeaning: string;
    sharpTranslation: string;
    betterExpression: (pronoun: string) => string;
    actionAdvice: string;
  }
> = {
  害怕被抛下: {
    possibleMeaning: "我不是不在意，我是在担心一旦开口，连现在这点联系都会失去。",
    sharpTranslation: "我先把委屈藏起来，是因为我怕自己一认真，你就会更快走远。",
    betterExpression: (pronoun) =>
      `我其实有点失落，也有点担心自己对${pronoun}来说没那么重要。你愿意跟我一起把这件事说清楚吗？`,
    actionAdvice: "先说感受，再说需求。把害怕失去翻译成可回应的信息，对方才接得住。",
  },
  害怕被控制: {
    possibleMeaning: "我不是没有想法，我是在防御那种一表达就被安排、被定义的感觉。",
    sharpTranslation: "我退回去说都行，不是因为我轻松，而是因为我不想再被推进你设好的节奏里。",
    betterExpression: () =>
      "我需要一点空间确认自己的感受，但我也愿意继续聊。我们能不能先各自说清楚想法，再一起决定？",
    actionAdvice: "别把边界说成冷淡。明确你的节奏和可接受范围，比突然抽离更不伤关系。",
  },
  害怕说真话: {
    possibleMeaning: "我知道自己在意，但我还没准备好直接承认，所以先拿轻描淡写做缓冲。",
    sharpTranslation: "嘴上说没事，只是为了避免让你看到我真正受伤的地方。",
    betterExpression: () =>
      "其实这件事让我有点难受，我刚刚没有直接说，是因为我怕气氛变僵。但我还是想让你知道真实感受。",
    actionAdvice: "少一点测试，多一点直说。把真话说短、说具体，往往比憋到失真更安全。",
  },
};

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

function getFearProfile(fearType: FearType | null) {
  return fearProfiles[fearType ?? "害怕说真话"];
}

function buildGenericFallbackReport(
  chatText: string,
  fearType: FearType | null,
  taPronoun: TaPronoun | null,
) {
  const original = extractOriginalSentence(chatText);
  const profile = getFearProfile(fearType);
  const pronoun = taPronoun ?? "TA";

  return sanitizeReport(
    {
      original,
      possibleMeaning: profile.possibleMeaning,
      sharpTranslation: profile.sharpTranslation,
      betterExpression: profile.betterExpression(pronoun),
      actionAdvice: profile.actionAdvice,
    },
    original,
  );
}

function findFallbackReport(chatText: string, fearType: FearType | null) {
  const original = extractOriginalSentence(chatText);
  const targetFearTypes = fearType ? [fearType] : FEAR_TYPE_OPTIONS;

  for (const currentFearType of targetFearTypes) {
    const matchedEntry = translatorFallbacks[currentFearType].find((entry) =>
      entry.match.some((pattern) => pattern.test(chatText)),
    );

    if (matchedEntry) {
      return sanitizeReport({ ...matchedEntry.report, original }, original);
    }
  }

  return undefined;
}

function resolveLocalReport(
  chatText: string,
  fearType: FearType | null,
  taPronoun: TaPronoun | null,
  notice?: string,
): ReportBuildResult {
  const matchedFallback = findFallbackReport(chatText, fearType);

  return {
    report: matchedFallback ?? buildGenericFallbackReport(chatText, fearType, taPronoun),
    usedFallback: true,
    notice,
  };
}

async function resolveRemoteReport(
  chatText: string,
  fearType: FearType | null,
  taPronoun: TaPronoun | null,
): Promise<ReportBuildResult> {
  try {
    const report = await llmClient.loveTranslate(chatText, {
      fearType,
      taPronoun,
    });

    if (!report) {
      return resolveLocalReport(
        chatText,
        fearType,
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
      fearType,
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
    fearType: input.fearType,
    pollutionCount: input.pollutionCount,
    deletedDraftCount: input.deletedDraftCount,
    loadCount: input.loadCount,
    aiTranslation: report.sharpTranslation,
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

  const reportResult = await resolveRemoteReport(normalized, null, null);
  return reportResult.report;
}

export async function translateConversation(
  input: TranslateConversationInput,
): Promise<TranslateConversationResult> {
  const chatText = normalizeText(input.chatText) || defaultMockChat;
  const reportResult = await resolveRemoteReport(chatText, input.fearType, input.taPronoun);
  const originalSentence = extractOriginalSentence(chatText);
  const shareLineResult = await resolveShareLine(
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
