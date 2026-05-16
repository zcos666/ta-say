import { defaultMockChat, shareLineFallbacks } from "../../config/fallbacks";
import type { LoveTranslationReport } from "../../types/api";
import type { SessionState, ShareCardData } from "../../types/session";

export interface ShareCardComposerInput {
  session: Pick<
    SessionState,
    | "chatHistory"
    | "deletedDraftCount"
    | "deletedDrafts"
    | "endingType"
    | "fearType"
    | "hasFinishedGame"
    | "hardestSentence"
    | "loadCount"
    | "pollutionCount"
    | "shareCardData"
    | "translatorReport"
    | "triggeredKeywords"
  >;
}

export interface ShareCardMetric {
  label: string;
  value: string;
}

export interface ShareCardViewModel {
  title: string;
  subtitle: string;
  endingType: string;
  hardestSentence: string;
  translatedHighlight: string;
  shareLine: string;
  fearTypeLabel: string;
  hasFinishedGame: boolean;
  metrics: ShareCardMetric[];
  footerLabel: string;
  tagLabel: string;
}

const endingShareLineFallbacks: Record<string, string> = {
  ...shareLineFallbacks,
  反话感染者: "你每说一句没事，系统就替你说一次有事。",
  循环恋人: "你不是想重来，你是想让这次终于有人听懂。",
  未发送的告白: "你没有告白失败，你只是从来没按下发送。",
  亲密逃亡者: "你想靠近，但每一次认真都像在撤退。",
  过度理解者: "你总说都可以，其实你只是没把答案说出口。",
};

const fearTypeSubtitleMap: Record<string, string> = {
  害怕被抛下: "你不是不在意，你只是总把等待演成体面。",
  害怕被控制: "你不是没有偏好，你只是把边界先藏了起来。",
  害怕说真话: "你不是不会表达，你只是把真话说成了反话。",
};

const fearTypeLabelMap: Record<string, string> = {
  害怕被抛下: "害怕被抛下型",
  害怕被控制: "害怕被控制型",
  害怕说真话: "害怕说真话型",
};

const defaultTranslation = "我不是没事，我是在等你发现我已经不开心。";

const wrapQuote = (text: string) => `“${text.replace(/^["“]|["”]$/g, "")}”`;

function getLastUserSentence(session: ShareCardComposerInput["session"]) {
  const userMessage = [...session.chatHistory]
    .reverse()
    .find((message) => message.role === "user" && (message.originalText || message.displayedText));

  return userMessage?.originalText || userMessage?.displayedText || defaultMockChat.split("\n")[1] || "没事，你忙吧。";
}

function resolveEndingType(session: ShareCardComposerInput["session"], storedCard?: ShareCardData) {
  if (storedCard?.endingType) {
    return storedCard.endingType;
  }

  if (session.endingType) {
    return session.endingType;
  }

  const deletedDraftText = session.deletedDrafts.join(" ");
  const triggeredText = session.triggeredKeywords.join(" ");

  if (/(喜欢|想你|爱你)/.test(deletedDraftText)) {
    return "未发送的告白";
  }

  if (/(分开|不要|太快)/.test(triggeredText)) {
    return "亲密逃亡者";
  }

  if (/(随便|都可以|都行)/.test(triggeredText)) {
    return "过度理解者";
  }

  const ranked = [
    { endingType: "反话感染者", score: session.pollutionCount },
    { endingType: "草稿幽灵", score: session.deletedDraftCount },
    { endingType: "循环恋人", score: session.loadCount },
  ].sort((left, right) => right.score - left.score);

  return ranked[0]?.score ? ranked[0].endingType : "梦醒翻译家";
}

function resolveHardestSentence(session: ShareCardComposerInput["session"], storedCard?: ShareCardData) {
  if (storedCard?.hardestSentence) {
    return storedCard.hardestSentence;
  }

  if (session.hardestSentence) {
    return session.hardestSentence;
  }

  return getLastUserSentence(session);
}

function resolveTranslatedHighlight(
  translatorReport: LoveTranslationReport | undefined,
  storedCard?: ShareCardData,
) {
  if (storedCard?.aiTranslation) {
    return storedCard.aiTranslation;
  }

  if (translatorReport?.sharpTranslation) {
    return translatorReport.sharpTranslation;
  }

  if (translatorReport?.possibleMeaning) {
    return translatorReport.possibleMeaning;
  }

  return defaultTranslation;
}

function resolveShareLine(endingType: string, storedCard?: ShareCardData) {
  if (storedCard?.shareLine) {
    return storedCard.shareLine;
  }

  return endingShareLineFallbacks[endingType] || "你没有输给爱情，你只是输给了那句没说出口的话。";
}

export function shareCardComposer({ session }: ShareCardComposerInput): ShareCardViewModel {
  const storedCard = session.shareCardData;
  const endingType = resolveEndingType(session, storedCard);
  const hardestSentence = resolveHardestSentence(session, storedCard);
  const translatedHighlight = resolveTranslatedHighlight(session.translatorReport, storedCard);
  const fearType = session.fearType || storedCard?.fearType || "害怕说真话";
  const shareLine = resolveShareLine(endingType, storedCard);

  return {
    title: "《过拟合恋人》关系幻觉报告",
    subtitle: fearTypeSubtitleMap[fearType] || fearTypeSubtitleMap["害怕说真话"],
    endingType,
    hardestSentence: wrapQuote(hardestSentence),
    translatedHighlight: wrapQuote(translatedHighlight),
    shareLine,
    fearTypeLabel: fearTypeLabelMap[fearType] || `${fearType}型`,
    hasFinishedGame: session.hasFinishedGame,
    metrics: [
      { label: "反义污染", value: `× ${storedCard?.pollutionCount ?? session.pollutionCount}` },
      { label: "删除草稿", value: `× ${storedCard?.deletedDraftCount ?? session.deletedDraftCount}` },
      { label: "读档失败", value: `× ${storedCard?.loadCount ?? session.loadCount}` },
    ],
    footerLabel: session.hasFinishedGame ? "系统判定：你已经看见了关系里的真实噪音。" : "系统判定：报告基于当前进度生成，继续体验可解锁完整结果。",
    tagLabel: session.hasFinishedGame ? "已通关样本" : "进行中样本",
  };
}
