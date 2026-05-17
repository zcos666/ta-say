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

export interface ShareCardAxis {
  label: string;
  value: number;
  description: string;
  interpretation: string;
}

export interface ShareCardViewModel {
  title: string;
  subtitle: string;
  endingType: string;
  resultLabel: string;
  verdictLine: string;
  dreamConversationPreview: string;
  dreamReferenceText: string;
  translatorContextText: string;
  hardestSentence: string;
  translatedHighlight: string;
  shareLine: string;
  profileTag: string;
  hasFinishedGame: boolean;
  metrics: ShareCardMetric[];
  profileCode: string;
  codeLegend: string;
  profileSummary: string;
  profileAxes: ShareCardAxis[];
  dominantAxisLabel: string;
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

const GENERIC_SUBTITLE = "你不是标签化的某一种人，你只是把最难说的话留在了更晚一点。";
const GENERIC_PROFILE_TAG = "关系样本";
const GENERIC_PROFILE_CODE = "RL";
const GENERIC_PROFILE_CODE_LEGEND = "RL = Relation Loop，基于本轮聊天行为生成的关系样本。";

const axisCodeMap: Record<string, string> = {
  嘴硬值: "MK",
  撤回欲: "RV",
  重开欲: "LP",
  显真率: "TR",
};

const axisCodeLegendMap: Record<string, string> = {
  嘴硬值: "MK = Mask，嘴上先戴面具。",
  撤回欲: "RV = Revoke，发出去前先撤回来。",
  重开欲: "LP = Loop，总想把关系再读档一次。",
  显真率: "TR = Truth，开始直接说真话。",
};

const resultLabelMap: Record<string, string> = {
  嘴硬值: "反话自动播放",
  撤回欲: "输入框临阵脱逃",
  重开欲: "上一句重来病",
  显真率: "真话恢复训练",
};

const verdictLineMap: Record<string, string> = {
  嘴硬值: "你最会把在意写成轻描淡写，让别人以为你只是随口一说。",
  撤回欲: "你的真心常常停在输入框里，差一点发出，差一点被看见。",
  重开欲: "你不是只想重来剧情，你只是想把关系修回一个更安全的版本。",
  显真率: "你已经越来越像那个肯把真实感受直接端出来的人了。",
};

const dominantAxisSummaryMap: Record<string, string> = {
  嘴硬值: "你最擅长把在意藏进轻描淡写里，越想显得没事，情绪越容易外露。",
  撤回欲: "你会先在脑内说完真话，再在发送前把它收回，怕被看见比怕被误解更强。",
  重开欲: "你很难接受一次说错，于是总想回到上一秒，把关系修成一个更安全的版本。",
  显真率: "你已经越来越接近真话本身，不再只靠试探和反话让别人来猜你。",
};

const defaultTranslation = "我不是没事，我是在等你发现我已经不开心。";

const wrapQuote = (text: string) => `“${text.replace(/^["“]|["”]$/g, "")}”`;

const clampAxis = (value: number) => Math.max(12, Math.min(96, Math.round(value)));

function describeAxis(label: string, value: number) {
  switch (label) {
    case "嘴硬值":
      return {
        description: "越高，越容易把“我很在意”包装成“我没事”。",
        interpretation: value >= 60 ? "你还在用轻描淡写保护真心。" : "这次你已经没那么嘴硬了。",
      };
    case "撤回欲":
      return {
        description: "越高，越容易在发送前删掉最真实的那句。",
        interpretation: value >= 60 ? "你会先在心里说真话，再在发出前收回。" : "你会犹豫，但大多数时候还会发出去。",
      };
    case "重开欲":
      return {
        description: "越高，越想回到上一句，把关系重新修一遍。",
        interpretation: value >= 60 ? "一旦觉得说错，你就很想重来一次。" : "你更愿意带着不完美继续往下聊。",
      };
    case "显真率":
      return {
        description: "越高，越接近把真实感受直接说出口。",
        interpretation: value >= 60 ? "这轮你已经很接近真话本人了。" : "你还在试探，还没有完全摊开自己。",
      };
    default:
      return {
        description: "数值越高，说明这一面越明显。",
        interpretation: "这是你这轮状态里比较突出的倾向。",
      };
  }
}

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

function resolveDreamReferenceText(session: ShareCardComposerInput["session"], storedCard?: ShareCardData) {
  if (storedCard?.dreamReferenceText?.trim()) {
    return storedCard.dreamReferenceText.trim();
  }

  if (session.hardestSentence?.trim()) {
    return session.hardestSentence.trim();
  }

  return getLastUserSentence(session);
}

function resolveDreamConversationPreview(session: ShareCardComposerInput["session"]) {
  const recentLines = session.chatHistory
    .filter((message) => message.role === "user" || message.role === "ta")
    .slice(-4)
    .map((message) => `${message.role === "user" ? "我" : "TA"}：${message.originalText || message.displayedText}`);

  if (recentLines.length > 0) {
    return recentLines.join("\n");
  }

  return "TA：醒了吗？\n我：没事，你忙吧。";
}

function resolveTranslatorContextText(storedCard?: ShareCardData) {
  return storedCard?.translatorContextText?.trim() ?? "";
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
  const dreamConversationPreview = resolveDreamConversationPreview(session);
  const dreamReferenceText = resolveDreamReferenceText(session, storedCard);
  const translatorContextText = resolveTranslatorContextText(storedCard);
  const translatedHighlight = resolveTranslatedHighlight(session.translatorReport, storedCard);
  const shareLine = resolveShareLine(endingType, storedCard);
  const pollutionCount = storedCard?.pollutionCount ?? session.pollutionCount;
  const deletedDraftCount = storedCard?.deletedDraftCount ?? session.deletedDraftCount;
  const loadCount = storedCard?.loadCount ?? session.loadCount;
  const hardSpeakValue = clampAxis(28 + pollutionCount * 14);
  const withdrawValue = clampAxis(24 + deletedDraftCount * 20);
  const replayValue = clampAxis(20 + loadCount * 24);
  const truthValue = clampAxis(
    34 +
      (session.hasFinishedGame ? 34 : 0) +
      Math.min(18, pollutionCount * 2 + deletedDraftCount * 3 + loadCount * 4),
  );
  const profileAxes: ShareCardAxis[] = [
    { label: "嘴硬值", value: hardSpeakValue, ...describeAxis("嘴硬值", hardSpeakValue) },
    { label: "撤回欲", value: withdrawValue, ...describeAxis("撤回欲", withdrawValue) },
    { label: "重开欲", value: replayValue, ...describeAxis("重开欲", replayValue) },
    { label: "显真率", value: truthValue, ...describeAxis("显真率", truthValue) },
  ];
  const dominantAxis = [...profileAxes].sort((left, right) => right.value - left.value)[0] ?? profileAxes[0];
  const dominantAxisLabel = dominantAxis?.label ?? "显真率";
  const profileCode = `${GENERIC_PROFILE_CODE}${axisCodeMap[dominantAxisLabel] ?? "TR"}`;
  const resultLabel = resultLabelMap[dominantAxisLabel] ?? resultLabelMap["显真率"];
  const verdictLine = verdictLineMap[dominantAxisLabel] ?? verdictLineMap["显真率"];

  return {
    title: "《过拟合恋人》关系幻觉报告",
    subtitle: GENERIC_SUBTITLE,
    endingType,
    resultLabel,
    verdictLine,
    dreamConversationPreview,
    dreamReferenceText: wrapQuote(dreamReferenceText),
    translatorContextText,
    hardestSentence: wrapQuote(hardestSentence),
    translatedHighlight: wrapQuote(translatedHighlight),
    shareLine,
    profileTag: GENERIC_PROFILE_TAG,
    hasFinishedGame: session.hasFinishedGame,
    metrics: [
      { label: "反义污染", value: `× ${pollutionCount}` },
      { label: "删除草稿", value: `× ${deletedDraftCount}` },
      { label: "读档失败", value: `× ${loadCount}` },
    ],
    profileCode,
    codeLegend: `${GENERIC_PROFILE_CODE_LEGEND} ${axisCodeLegendMap[dominantAxisLabel] ?? ""}`.trim(),
    profileSummary:
      dominantAxisSummaryMap[dominantAxisLabel] ?? dominantAxisSummaryMap["显真率"],
    profileAxes,
    dominantAxisLabel,
    footerLabel: session.hasFinishedGame ? "系统判定：你已经看见了关系里的真实噪音。" : "系统判定：报告基于当前进度生成，继续体验可解锁完整结果。",
    tagLabel: session.hasFinishedGame ? "已通关样本" : "进行中样本",
  };
}
