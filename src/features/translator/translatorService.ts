import { defaultMockChat, shareLineFallbacks, translatorFallbacks } from "../../config/fallbacks";
import { buildHardcodedTranslationReport, findBestSubtextMapping } from "../../config/subtextMappings";
import { llmClient } from "../../services/api/llmClient";
import type {
  LoveTranslationReport,
  RelationshipAnalysisReport,
  RelationshipAdviceBlock,
  RelationshipInsightBlock,
  RelationshipKeyMoment,
  TaPronoun,
} from "../../types/api";
import type { ShareCardData } from "../../types/session";

export interface TranslateConversationInput {
  conversationText: string;
  includeShareArtifacts?: boolean;
  endingType: string | null;
  pollutionCount: number;
  deletedDraftCount: number;
  loadCount: number;
  hardestSentence: string;
  hasFinishedGame: boolean;
}

export interface TranslateConversationResult {
  report: RelationshipAnalysisReport;
  legacyReport: LoveTranslationReport;
  shareCardData: ShareCardData;
  inputSummary: ParsedConversationSummary;
  usedFallback: boolean;
  shareLineUsedFallback: boolean;
  notices: string[];
}

type ReportBuildResult = {
  report: RelationshipAnalysisReport;
  legacyReport: LoveTranslationReport;
  usedFallback: boolean;
  notice?: string;
};

export interface ParsedConversationTurn {
  speaker: "self" | "other" | "unknown";
  text: string;
  originalLabel?: string;
}

export interface ParsedConversationSummary {
  turns: ParsedConversationTurn[];
  normalizedConversation: string;
  rawLineCount: number;
  mergedTurnCount: number;
  selfCount: number;
  otherCount: number;
  unknownCount: number;
  hasSpeakerLabels: boolean;
  warnings: string[];
}

const GENERIC_SHARE_LINE = "你删掉的话，比你发出去的更诚实。";
export const SAMPLE_TRANSLATOR_CONVERSATION = [
  "TA: 你先去吧，我这边还没弄完。",
  "我: 好，你忙。",
  "TA: 怎么了？",
  "我: 没怎么，就是感觉你今天一直挺忙的。",
  "TA: 最近事情有点多。",
  "我: 嗯，没事，你先忙吧。",
  "TA: 你是不是有点不开心？",
  "我: 也不是不开心，就是有点不知道该不该打扰你。",
].join("\n");

function normalizeText(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

function resolveSpeaker(label: string): ParsedConversationTurn["speaker"] {
  const normalized = label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/说$|回复$|回$|发$/g, "");

  if (["我", "自己", "本人", "老子", "me", "user", "mine", "self", "楼主", "lz"].includes(normalized)) {
    return "self";
  }

  if (["ta", "他", "她", "对方", "别人", "对面", "partner", "男生", "女生", "对象"].includes(normalized)) {
    return "other";
  }

  return "unknown";
}

function normalizeSpeakerLabel(speaker: ParsedConversationTurn["speaker"], originalLabel?: string) {
  if (speaker === "self") {
    return "我";
  }

  if (speaker === "other") {
    return "TA";
  }

  return sanitizeField(originalLabel, "未标注");
}

export function parseConversationText(conversationText: string): ParsedConversationSummary {
  const normalized = normalizeText(conversationText);
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const rawTurns = lines.map<ParsedConversationTurn>((line) => {
    const matched = line.match(/^([^:：]{1,8})[:：]\s*(.+)$/);

    if (!matched) {
      return {
        speaker: "unknown",
        text: line,
      };
    }

    const [, rawLabel, rawText] = matched;
    return {
      speaker: resolveSpeaker(rawLabel),
      text: rawText.trim(),
      originalLabel: rawLabel.trim(),
    };
  });

  const turns = rawTurns.reduce<ParsedConversationTurn[]>((accumulator, turn) => {
    const previousTurn = accumulator[accumulator.length - 1];

    if (!previousTurn) {
      accumulator.push(turn);
      return accumulator;
    }

    if (turn.speaker === "unknown" && previousTurn.speaker !== "unknown") {
      previousTurn.text = `${previousTurn.text}\n${turn.text}`.trim();
      return accumulator;
    }

    if (turn.speaker !== "unknown" && previousTurn.speaker === turn.speaker) {
      previousTurn.text = `${previousTurn.text}\n${turn.text}`.trim();
      return accumulator;
    }

    accumulator.push(turn);
    return accumulator;
  }, []);

  const selfCount = turns.filter((turn) => turn.speaker === "self").length;
  const otherCount = turns.filter((turn) => turn.speaker === "other").length;
  const unknownCount = turns.filter((turn) => turn.speaker === "unknown").length;
  const hasSpeakerLabels = rawTurns.some((turn) => turn.originalLabel);
  const warnings: string[] = [];

  if (turns.length < 3) {
    warnings.push("聊天轮次偏少，建议至少提供 3 句以上关键对话。");
  }

  if (!hasSpeakerLabels || selfCount === 0 || otherCount === 0) {
    warnings.push("建议同时标出 `我:` 和 `TA:`，这样更容易读出互动节奏。");
  }

  if (unknownCount > 0) {
    warnings.push(`有 ${unknownCount} 句没有被明确识别说话人，系统会按原文继续分析。`);
  }

  if (rawTurns.length !== turns.length) {
    warnings.push("已自动合并连续发言或未标注的续句，分析将基于整理后的版本进行。");
  }

  return {
    turns,
    normalizedConversation: turns
      .map((turn) => `${normalizeSpeakerLabel(turn.speaker, turn.originalLabel)}: ${turn.text}`)
      .join("\n"),
    rawLineCount: lines.length,
    mergedTurnCount: turns.length,
    selfCount,
    otherCount,
    unknownCount,
    hasSpeakerLabels,
    warnings,
  };
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

function sanitizeList(list: string[] | undefined, fallback: string[]) {
  const values = (list ?? []).map((item) => item.trim()).filter(Boolean);
  return values.length > 0 ? values.slice(0, 3) : fallback;
}

function sanitizeInsightBlock(
  block: RelationshipInsightBlock | undefined,
  fallbackSummary: string,
  fallbackTraits: string[],
): RelationshipInsightBlock {
  return {
    summary: sanitizeField(block?.summary, fallbackSummary),
    traits: sanitizeList(block?.traits, fallbackTraits),
  };
}

function sanitizeKeyMoments(
  moments: RelationshipKeyMoment[] | undefined,
  fallbackQuote: string,
): RelationshipKeyMoment[] {
  const sanitized = (moments ?? [])
    .map((moment) => ({
      title: sanitizeField(moment.title, "关键片段"),
      quote: sanitizeField(moment.quote, fallbackQuote),
      insight: sanitizeField(moment.insight, "这段对话暴露了你们当下的错位方式。"),
    }))
    .filter((moment) => moment.quote.trim().length > 0)
    .slice(0, 3);

  if (sanitized.length > 0) {
    return sanitized;
  }

  return [
    {
      title: "关键片段",
      quote: fallbackQuote,
      insight: "这段对话本身已经说明，你们更容易把真实感受放进暗示，而不是直接摆出来。",
    },
  ];
}

function sanitizeAdvice(
  advice: RelationshipAdviceBlock | undefined,
  fallbackDirection: string,
): RelationshipAdviceBlock {
  return {
    direction: sanitizeField(advice?.direction, fallbackDirection),
    doMore: sanitizeList(advice?.doMore, ["先把真实感受说清楚", "优先描述事实和期待"]),
    avoid: sanitizeList(advice?.avoid, ["不要继续让对方猜", "不要把在意全部包装成无所谓"]),
    nextStep: sanitizeField(advice?.nextStep, "下一次沟通时，先说你真实在意的点，再说你希望对方如何回应。"),
  };
}

function buildFallbackAnalysisReport(conversationText: string): RelationshipAnalysisReport {
  const parsed = parseConversationText(conversationText);
  const lines = parsed.turns;
  const lastQuote =
    lines[lines.length - 1]
      ? `${normalizeSpeakerLabel(lines[lines.length - 1].speaker, lines[lines.length - 1].originalLabel)}: ${lines[lines.length - 1].text}`
      : "我: 没事，你忙吧。";
  const relationshipState =
    parsed.selfCount > 0 && parsed.otherCount > 0
      ? "关系目前处在有来有回但带着试探的轻微拉扯阶段。"
      : "聊天信息还不够完整，目前更像是局部片段里的模糊误解。";
  const selfSummary =
    parsed.selfCount >= parsed.otherCount
      ? "你在这段关系里表达并不少，但更容易在关键情绪上收住，把真实需求包进退让或解释里。"
      : "你的表达存在感偏弱，更容易把真实想法压到后面，先选择观察和试探。";
  const otherSummary =
    parsed.otherCount > 0
      ? "对方会给回应，但表达方式偏保守或不够明确，容易让你感到需要自己去补全真实态度。"
      : "当前输入里对方的信息偏少，所以很多判断仍然只能停留在可能性推断。";

  return {
    summary: "这段关系里最明显的问题，不是没人想沟通，而是双方都在用更安全但更模糊的方式表达在意。",
    relationshipState,
    selfProfile: {
      summary: selfSummary,
      traits: ["在意会先说轻", "希望被理解但不想显得太需要", "表达需求偏晚"],
    },
    otherProfile: {
      summary: otherSummary,
      traits: ["表达偏模糊", "反馈不够直给", "更像在维持气氛而不是主动澄清"],
    },
    interactionPattern: [
      "你们都在降低情绪强度，结果重要信息反而更容易被藏起来。",
      "你在等对方先确认，对方也在等更安全的时机表达。",
      "关系里的卡点更多来自错位，不一定来自明确冲突。",
    ],
    keyMoments: sanitizeKeyMoments(undefined, lastQuote),
    mainIssues: [
      "真实需求没有被及时说出来",
      "双方表达方式都偏模糊，容易靠脑补补全",
      "关系判断更多依赖猜测而不是确认",
    ],
    communicationAdvice: {
      direction: "比起继续试探，更适合把真实感受稍微说清楚一点。",
      doMore: ["先说事实", "再说感受", "最后说希望对方怎么回应"],
      avoid: ["不要继续只说反话", "不要把关键需求全压成暗示"],
      nextStep: "下一次沟通时，尽量用一句明确但不过度用力的话，把你真正介意的点说出来。",
    },
  };
}

function sanitizeAnalysisReport(
  report: RelationshipAnalysisReport,
  conversationText: string,
): RelationshipAnalysisReport {
  const fallback = buildFallbackAnalysisReport(conversationText);

  return {
    summary: sanitizeField(report.summary, fallback.summary),
    relationshipState: sanitizeField(report.relationshipState, fallback.relationshipState),
    selfProfile: sanitizeInsightBlock(report.selfProfile, fallback.selfProfile.summary, fallback.selfProfile.traits),
    otherProfile: sanitizeInsightBlock(report.otherProfile, fallback.otherProfile.summary, fallback.otherProfile.traits),
    interactionPattern: sanitizeList(report.interactionPattern, fallback.interactionPattern),
    keyMoments: sanitizeKeyMoments(report.keyMoments, fallback.keyMoments[0]?.quote ?? conversationText),
    mainIssues: sanitizeList(report.mainIssues, fallback.mainIssues),
    communicationAdvice: sanitizeAdvice(report.communicationAdvice, fallback.communicationAdvice.direction),
  };
}

function buildLegacyReportFromAnalysis(report: RelationshipAnalysisReport): LoveTranslationReport {
  return {
    original: report.keyMoments[0]?.quote || report.summary,
    possibleMeaning: report.selfProfile.summary,
    sharpTranslation: report.summary,
    betterExpression: report.communicationAdvice.nextStep,
    actionAdvice: report.communicationAdvice.direction,
  };
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

function findHardcodedReport(chatText: string, taPronoun: TaPronoun | null) {
  const original = extractOriginalSentence(chatText);
  const matched = findBestSubtextMapping(original);

  if (!matched) {
    return undefined;
  }

  return sanitizeReport(buildHardcodedTranslationReport(original, matched, taPronoun), original);
}

function resolveLocalReport(
  conversationText: string,
  notice?: string,
): ReportBuildResult {
  const normalized = normalizeText(conversationText);
  const matchedFallback = findFallbackReport(normalized, "");
  const legacyReport = matchedFallback ?? buildGenericFallbackReport(normalized, "");
  const report = buildFallbackAnalysisReport(normalized);

  return {
    report,
    legacyReport,
    usedFallback: true,
    notice,
  };
}

async function resolveRemoteReport(
  conversationText: string,
): Promise<ReportBuildResult> {
  if (!llmClient.isEnabled()) {
    return resolveLocalReport(conversationText, "分析服务暂不可用，已切换到本地解析。");
  }

  try {
    const llmReport = await llmClient.relationshipAnalyze(conversationText);

    if (llmReport) {
      const sanitizedReport = sanitizeAnalysisReport(llmReport, conversationText);
      return {
        report: sanitizedReport,
        legacyReport: buildLegacyReportFromAnalysis(sanitizedReport),
        usedFallback: false,
        notice: undefined,
      };
    }
  } catch {
    return resolveLocalReport(conversationText, "分析服务波动，已切换到本地解析。");
  }

  return resolveLocalReport(conversationText, "分析结果为空，已切换到本地解析。");
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
  if (!llmClient.isEnabled()) {
    return {
      shareLine: buildLocalShareLine(endingType),
      usedFallback: true,
      notice: "分享短句服务暂不可用，已切换到本地文案。",
    };
  }

  try {
    const response = await llmClient.shareLine({
      endingType: endingType ?? "梦醒翻译家",
      hardestSentence,
      pollutionCount,
      deletedCount: deletedDraftCount,
      loadCount,
    });

    const shareLine = response?.shareLine?.trim();
    if (shareLine) {
      return {
        shareLine,
        usedFallback: false,
        notice: undefined,
      };
    }
  } catch {
    return {
      shareLine: buildLocalShareLine(endingType),
      usedFallback: true,
      notice: "分享短句服务波动，已切换到本地文案。",
    };
  }

  return {
    shareLine: buildLocalShareLine(endingType),
    usedFallback: true,
    notice: "分享短句结果为空，已切换到本地文案。",
  };
}

function buildShareCardData(
  input: TranslateConversationInput,
  report: LoveTranslationReport,
  shareLine: string,
): ShareCardData {
  const originalSentence = extractOriginalSentence(input.conversationText, "");
  return {
    endingType: input.endingType ?? "梦醒翻译家",
    hardestSentence: originalSentence,
    shareLine,
    pollutionCount: input.pollutionCount,
    deletedDraftCount: input.deletedDraftCount,
    loadCount: input.loadCount,
    aiTranslation: report.sharpTranslation,
    dreamReferenceText: sanitizeField(input.hardestSentence, originalSentence),
    translatorContextText: sanitizeField(input.conversationText, ""),
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

  const report = await llmClient.loveTranslate(normalized, { taPronoun: null });
  return report ? sanitizeReport(report, extractOriginalSentence(normalized, "")) : buildGenericFallbackReport(normalized, "");
}

export async function translateConversation(
  input: TranslateConversationInput,
): Promise<TranslateConversationResult> {
  const conversationText = normalizeText(input.conversationText);

  if (!conversationText) {
    throw new Error("请先填入聊天记录。");
  }

  const parsedSummary = parseConversationText(conversationText);
  const normalizedConversation = parsedSummary.normalizedConversation || conversationText;

  if (parsedSummary.turns.length < 2) {
    throw new Error("聊天记录太短了，至少给我两句以上关键对话。");
  }

  const originalSentence = extractOriginalSentence(normalizedConversation, "");
  const reportResult = await resolveRemoteReport(normalizedConversation);
  const shareLineResult = input.includeShareArtifacts === false
    ? {
        shareLine: buildLocalShareLine(input.endingType),
        usedFallback: false,
        notice: undefined,
      }
    : await resolveShareLine(
        input.endingType,
        originalSentence,
        input.pollutionCount,
        input.deletedDraftCount,
        input.loadCount,
      );

  const notices = [...parsedSummary.warnings, reportResult.notice, shareLineResult.notice].filter(
    (notice): notice is string => Boolean(notice),
  );

  return {
    report: reportResult.report,
    legacyReport: reportResult.legacyReport,
    inputSummary: parsedSummary,
    shareCardData: buildShareCardData(
      {
        ...input,
        conversationText: normalizedConversation,
      },
      reportResult.legacyReport,
      shareLineResult.shareLine,
    ),
    usedFallback: reportResult.usedFallback,
    shareLineUsedFallback: shareLineResult.usedFallback,
    notices,
  };
}
