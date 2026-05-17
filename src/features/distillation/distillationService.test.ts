import { describe, expect, it } from "vitest";

import { normalizeConversationInput } from "./conversationNormalizer";
import { sanitizeDistilledProfile } from "./distillationService";

describe("conversationNormalizer", () => {
  it("支持按中文说话人标签解析聊天记录，并合并续行内容", () => {
    const normalized = normalizeConversationInput([
      "我：今天其实有点不舒服",
      "但刚刚没想直接说",
      "TA：你是不是又在硬撑",
    ].join("\n"));

    expect(normalized).toEqual([
      {
        speaker: "self",
        content: "今天其实有点不舒服 但刚刚没想直接说",
        metadata: {
          rawSpeakerLabel: "我",
        },
      },
      {
        speaker: "other",
        content: "你是不是又在硬撑",
        metadata: {
          rawSpeakerLabel: "TA",
        },
      },
    ]);
  });

  it("缺少双方说话人时给出明确错误", () => {
    expect(() =>
      normalizeConversationInput(["我：只有我一个人在说", "我：我还在继续说"].join("\n")),
    ).toThrow("同时包含 self 和 other");
  });
});

describe("sanitizeDistilledProfile", () => {
  it("会清洗蒸馏结果并补上目标主体", () => {
    const result = sanitizeDistilledProfile("self", {
      summary: "会先压低自己的需求感。",
      styleTags: ["克制", "克制", "嘴硬"],
      emotionalTraits: ["怕麻烦对方", " "],
      communicationHabits: ["先观察再表达"],
      interactionPreferences: ["更希望对方主动确认"],
      relationshipSignals: ["在意，但表达偏晚"],
      evidence: [
        { quote: "没事，你先忙。", reason: "表面退让，实际在压住自己的需求。" },
        { quote: "", reason: "这条应被过滤" },
      ],
    });

    expect(result).toEqual({
      subject: "self",
      summary: "会先压低自己的需求感。",
      styleTags: ["克制", "嘴硬"],
      emotionalTraits: ["怕麻烦对方"],
      communicationHabits: ["先观察再表达"],
      interactionPreferences: ["更希望对方主动确认"],
      relationshipSignals: ["在意，但表达偏晚"],
      evidence: [
        { quote: "没事，你先忙。", reason: "表面退让，实际在压住自己的需求。" },
      ],
    });
  });

  it("缺少 summary 时拒绝把错误结果当成功", () => {
    expect(() =>
      sanitizeDistilledProfile("other", {
        styleTags: ["回避"],
      }),
    ).toThrow("缺少 summary");
  });
});
