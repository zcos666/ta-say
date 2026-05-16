export interface PollutionRule {
  keyword: string;
  pollutedText: string;
}

export const pollutionRules: PollutionRule[] = [
  { keyword: "没事", pollutedText: "我很在意，只是不想把委屈说得太明显。" },
  { keyword: "随便", pollutedText: "我一点都不随便，我想让你选我。" },
  { keyword: "都行", pollutedText: "我其实有答案，只是怕你觉得我麻烦。" },
  { keyword: "算了", pollutedText: "我没算了，我只是又把那口气咽回去了。" },
  { keyword: "不用", pollutedText: "我很想要，只是怕你觉得我离不开你。" },
  { keyword: "晚安", pollutedText: "别急着晚安，我还在等一句真的在乎。" },
  { keyword: "你忙", pollutedText: "你去忙吧，但请别把我晾成默认选项。" },
  { keyword: "我懂", pollutedText: "我不是真的懂，我只是习惯先原谅你。" },
  { keyword: "下次", pollutedText: "我怕根本没有下次，只能先假装有。" },
  { keyword: "可以", pollutedText: "我说可以，是因为不敢说不可以。" }
];

export function findKeywordRule(input: string): PollutionRule | undefined {
  return pollutionRules.find((rule) => input.includes(rule.keyword));
}
