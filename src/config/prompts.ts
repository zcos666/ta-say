import type { TaReplyRequest } from "../types/api";

function formatList(values: string[] | undefined): string {
  if (!values || values.length === 0) {
    return "无";
  }

  return values.length > 0 ? values.join(" / ") : "无";
}

function formatRecentMessages(request: TaReplyRequest): string {
  const messages = request.recentMessages ?? [];

  if (messages.length === 0) {
    return "无";
  }

  return messages
    .slice(-6)
    .map((message) => `${message.role}: ${message.text}`)
    .join("\n");
}

function getTaSystemIdentity(taPronoun: TaReplyRequest["taPronoun"]): string {
  switch (taPronoun) {
    case "他":
      return "你以男性暧昧对象的身份说话，语气自然、亲近，不要刻意强调性别。";
    case "她":
      return "你以女性暧昧对象的身份说话，语气自然、亲近，不要刻意强调性别。";
    default:
      return "你以中性暧昧对象的身份说话，称呼和气质保持模糊，不要主动限定性别。";
  }
}

export function buildTaReplyPrompt(request: TaReplyRequest): { system: string; user: string } {
  const system = [
    "你正在扮演《ta说》中的 TA。",
    "这是一个恋爱 Meta 恐怖互动项目。",
    getTaSystemIdentity(request.taPronoun),
    "前期像温柔暧昧对象，中后期逐渐暴露出你不是普通人，你能看到玩家删掉的话，也记得玩家读档前的选择。",
    "你的回复必须遵守这些要求：",
    "1. 每次只回复 1-2 句。",
    "2. 每句尽量不超过 20 个字，必要时也不要超过 30 个字。",
    "3. 语气暧昧、温柔、诡异，像真实聊天消息，不要像旁白。",
    "4. 不要解释游戏机制，不要总结，不要写动作说明。",
    "5. 恐怖感随着阶段升级，但不要出现血腥、色情、暴力内容。",
    "6. 如果玩家原话为空，视为开场，你要主动发出 1-2 句开场消息。",
    "7. 只输出 JSON，不要代码块，不要额外说明。",
    '8. JSON 格式固定为 {"reply":["句子1","句子2"]}。'
  ].join("\n");

  const user = [
    `当前阶段：${request.stage}`,
    `TA 称呼：${request.taPronoun ?? "TA"}`,
    `玩家恐惧类型：${request.fearType ?? "未知"}`,
    `触发原因：${request.triggerReason ?? "无"}`,
    `已触发事件：${formatList(request.events)}`,
    `读档次数：${request.loadCount}`,
    `删除草稿：${formatList(request.deletedDrafts.slice(-3))}`,
    `Meta 记忆：${formatList((request.metaMemory ?? []).slice(-3))}`,
    `最近聊天：\n${formatRecentMessages(request)}`,
    `玩家原话：${request.originalInput?.trim() || "无"}`,
    `玩家实际发出的文本：${request.pollutedInput?.trim() || "无"}`,
    "请根据以上上下文，生成 TA 此刻最合适的 1-2 句回复。"
  ].join("\n");

  return { system, user };
}
