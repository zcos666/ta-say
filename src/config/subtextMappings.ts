import type { LoveTranslationReport, TaPronoun } from "../types/api";

export interface SubtextMappingEntry {
  aliases: string[];
  possibleMeaning: string;
  sharpTranslation: string;
  betterExpression: (pronoun: TaPronoun | null) => string;
  actionAdvice: string;
}

export interface MatchedSubtextMapping {
  entry: SubtextMappingEntry;
  matchedAlias: string;
}

const subtextMappings: SubtextMappingEntry[] = [
  {
    aliases: ["没事，你忙吧", "你忙吧", "不打扰你了", "先不打扰了"],
    possibleMeaning: "我不是不在意，我是在等你主动停下手里的事，回来哄我。",
    sharpTranslation: "我嘴上让你去忙，其实是在等你说你不忙，等你继续陪我。",
    betterExpression: () => "其实我有点失落。我不是想把你推开，我只是想知道你会不会愿意留下来陪我一会儿。",
    actionAdvice: "少一点把在意说成体面，多一点把真实需求说清楚。",
  },
  {
    aliases: ["没事", "我没事", "挺好的", "一切正常"],
    possibleMeaning: "我其实有事，只是不想显得自己太需要安慰。",
    sharpTranslation: "我根本不是没事，我是在死撑，等你主动发现我情绪不对。",
    betterExpression: () => "其实我现在不太好，只是刚刚没直接说。我想让你知道我需要一点安慰。",
    actionAdvice: "当你希望被理解时，直接指出情绪，比让对方猜更有效。",
  },
  {
    aliases: ["随便", "都行", "都可以", "无所谓"],
    possibleMeaning: "我不是没有想法，我是在看你会不会在意我的偏好。",
    sharpTranslation: "我嘴上说都行，其实心里已经有答案，只是不想先把底牌亮出来。",
    betterExpression: () => "我其实有偏好，只是刚刚没有直接说。比起都行，我更想要那个让我舒服一点的选项。",
    actionAdvice: "把偏好说出来，不会显得麻烦，反而能减少误解。",
  },
  {
    aliases: ["算了", "算了吧", "晚安", "先这样吧"],
    possibleMeaning: "我不是完全放下了，我只是怕继续说下去会更难受。",
    sharpTranslation: "我说算了，不是因为真的过去了，而是因为我已经有点失望，不想再把自己摊开一次。",
    betterExpression: () => "这件事我其实还在意，只是我现在有点累了。等我缓一下，我还是想和你好好说清楚。",
    actionAdvice: "当你想结束争执时，可以结束当下情绪，但别一并结束问题本身。",
  },
];

function normalizeText(value: string) {
  return value.replace(/\s+/g, "").trim();
}

export function findBestSubtextMapping(input: string): MatchedSubtextMapping | undefined {
  const normalizedInput = normalizeText(input);

  for (const entry of subtextMappings) {
    const matchedAlias = entry.aliases.find((alias) => normalizedInput.includes(normalizeText(alias)));
    if (matchedAlias) {
      return {
        entry,
        matchedAlias,
      };
    }
  }

  return undefined;
}

export function buildHardcodedTranslationReport(
  original: string,
  matched: MatchedSubtextMapping,
  taPronoun: TaPronoun | null,
): LoveTranslationReport {
  return {
    original,
    possibleMeaning: matched.entry.possibleMeaning,
    sharpTranslation: matched.entry.sharpTranslation,
    betterExpression: matched.entry.betterExpression(taPronoun),
    actionAdvice: matched.entry.actionAdvice,
  };
}
