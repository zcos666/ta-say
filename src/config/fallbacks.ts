import type { LoveTranslationReport } from "../types/api";

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

export const translatorFallbacks: FallbackEntry[] = [
  {
    match: [/没事/, /算了/],
    report: baseReport,
  },
  {
    match: [/都行/, /你决定/],
    report: {
      ...baseReport,
      original: "都行，你决定吧。",
      possibleMeaning: "我不是完全没有偏好，我只是懒得再把自己的感受解释一遍。",
      sharpTranslation: "不是我真的都行，是我已经先把想说的话缩回去了。",
      betterExpression: "我现在有点拿不准，但我更想先听听你的想法，再一起选一个我们都舒服的方案。",
    },
  },
  {
    match: [/随便/, /之后再说/],
    report: {
      ...baseReport,
      possibleMeaning: "我不是真的轻松，我只是先把情绪压低，免得显得自己很在意。",
      sharpTranslation: "我把在意说轻，不是因为没感觉，而是怕真说出来以后更难收回。",
    },
  },
];

export const shareLineFallbacks: Record<string, string> = {
  草稿幽灵: "你删掉的话，比你发出去的更诚实。",
  反义失真: "最伤人的不是不爱，是把在意说成没事。",
  梦醒翻译家: "通关之后，你终于肯把情绪翻译成人话。",
};

export const defaultMockChat = `A: 你今天怎么这么晚回？\nB: 没事，你忙吧。`;
