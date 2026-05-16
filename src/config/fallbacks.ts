import type { FearType, LoveTranslationReport } from "../types/api";

type FallbackEntry = {
  match: RegExp[];
  report: LoveTranslationReport;
};

const baseReport: LoveTranslationReport = {
  original: "没事，你忙吧。",
  possibleMeaning: "我其实有情绪，但我不想显得自己太主动。",
  sharpTranslation: "我不是没事，我是在等你发现我已经失望了。",
  betterExpression: "我知道你在忙，但我等了很久，心里有点失落。你愿意跟我说说刚刚发生了什么吗？",
  actionAdvice: "别用试探包装需求，把具体的感受说出来，关系才不会被误会耗空。",
};

export const translatorFallbacks: Record<FearType, FallbackEntry[]> = {
  害怕被抛下: [
    {
      match: [/没事/, /随便/],
      report: {
        ...baseReport,
        possibleMeaning: "我怕自己显得太黏人，所以只好假装轻松。",
        sharpTranslation: "我嘴上说没事，心里其实在担心你已经把我放到不重要的位置。",
      },
    },
  ],
  害怕被控制: [
    {
      match: [/都行/, /你决定/],
      report: {
        ...baseReport,
        original: "都行，你决定吧。",
        possibleMeaning: "我不想再解释自己的偏好，因为我担心一表达就会被定义成麻烦。",
        sharpTranslation: "不是我真的都行，是我已经懒得争取自己想要的东西。",
        betterExpression: "我现在有点拿不准，但我更倾向于先听听你的想法，再一起选一个我们都舒服的方案。",
      },
    },
  ],
  害怕说真话: [
    {
      match: [/没事/, /算了/],
      report: baseReport,
    },
  ],
};

export const shareLineFallbacks: Record<string, string> = {
  草稿幽灵: "你删掉的话，比你发出去的更诚实。",
  反义失真: "最伤人的不是不爱，是把在意说成没事。",
  梦醒翻译家: "通关之后，你终于肯把情绪翻译成人话。",
};

export const defaultMockChat = `A: 你今天怎么这么晚回？\nB: 没事，你忙吧。`;
