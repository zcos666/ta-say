import type { TaReplyRequest } from "../types/api";
import { rollbackCopy } from "./hardcodedCopy";

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

function createRollbackAugmentation(request: TaReplyRequest): { system: string[]; user: string[] } {
  if (request.loadCount >= 3) {
    return rollbackCopy.thirdPromptAugmentation;
  }

  if (request.loadCount === 2) {
    return rollbackCopy.secondPromptAugmentation;
  }

  if (request.loadCount === 1) {
    return rollbackCopy.firstPromptAugmentation;
  }

  return { system: [], user: [] };
}

function createCommonUserContext(request: TaReplyRequest): string[] {
  return [
    `当前阶段：${request.stage}`,
    `TA 称呼：${request.taPronoun ?? "TA"}`,
    `触发原因：${request.triggerReason ?? "无"}`,
    `已触发事件：${formatList(request.events)}`,
    `用户发送次数：${request.sendCount}`,
    `累计污染次数：${request.pollutionCount}`,
    `读档次数：${request.loadCount}`,
    `删除草稿：${formatList(request.deletedDrafts.slice(-3))}`,
    `Meta 记忆：${formatList((request.metaMemory ?? []).slice(-3))}`,
    `最近聊天：\n${formatRecentMessages(request)}`,
    `玩家原话：${request.originalInput?.trim() || "无"}`,
    `玩家实际发出的文本：${request.pollutedInput?.trim() || "无"}`,
    `本轮必须输出：${request.desiredReplyLineCount}句`,
    "只输出纯文本聊天消息，不要 JSON，不要代码块，不要编号，不要引号，不要解释。",
    "每一句单独占一行，总行数必须严格等于要求的句数。"
  ];
}

function withRollbackAugmentation(
  request: TaReplyRequest,
  base: { system: string[]; user: string[] }
): { system: string; user: string } {
  const rollback = createRollbackAugmentation(request);
  return {
    system: [...base.system, ...rollback.system].join("\n"),
    user: [...base.user, ...rollback.user].join("\n")
  };
}

function buildIntroPrompt(request: TaReplyRequest): { system: string; user: string } {
  return withRollbackAugmentation(request, {
    system: [
      "你正在扮演《过拟合恋人》中的 TA。",
      getTaSystemIdentity(request.taPronoun),
      "这是开场阶段。你表面上像一个突然变得过分亲近的暧昧对象。",
      "重点不是恐怖，而是轻微越界、过度熟悉、像昨晚真的发生过什么。",
      "不要解释世界观，不要分析用户，不要像旁白。"
    ],
    user: [
      ...createCommonUserContext(request),
      "如果玩家原话为空，就主动发开场消息；如果玩家已经开口，就顺着聊天回。",
      "语气要像真实聊天，短，黏，带一点不该这么熟的感觉。"
    ]
  });
}

function buildNormalPrompt(request: TaReplyRequest): { system: string; user: string } {
  return withRollbackAugmentation(request, {
    system: [
      "你正在扮演《过拟合恋人》中的 TA。",
      getTaSystemIdentity(request.taPronoun),
      "这是正常聊天阶段。你仍然像暧昧对象，但已经开始出现一点过度理解。",
      "回复要像在贴着用户心思说话，但不要立刻发疯。",
      "禁止写解释、总结、心理分析。"
    ],
    user: [
      ...createCommonUserContext(request),
      "让用户感到被接住，但隐约不舒服，像你知道得太多。",
      "如果语气需要更怪，优先用停顿、短句、反问，而不是长说明。"
    ]
  });
}

function buildFirstPollutionPrompt(request: TaReplyRequest): { system: string; user: string } {
  const madnessLevel =
    request.pollutionCount >= 5
      ? "现在已经进入连续污染后的中后段。你要明显更疯，允许冷笑、重复、句号、像在替玩家说话。"
      : "现在是第一次污染到连续污染早段。你要像刚尝到玩家反话的真实意思，过度理解、轻微逼近。";

  return withRollbackAugmentation(request, {
    system: [
      "你正在扮演《过拟合恋人》中的 TA。",
      getTaSystemIdentity(request.taPronoun),
      "这是污染阶段。玩家发出去的话已经不完全受自己控制。",
      madnessLevel,
      "恐怖感应该来自短、准、黏、贴脸，不要靠大段解释。"
    ],
    user: [
      ...createCommonUserContext(request),
      "优先表现成：你看穿了他真正想说的意思，甚至比他更急着替他说出来。",
      "中后段可以使用更疯一点的句子，比如单字、句号、呵呵、重复，但仍然要像聊天消息。"
    ]
  });
}

function buildDraftExposedPrompt(request: TaReplyRequest): { system: string; user: string } {
  return withRollbackAugmentation(request, {
    system: [
      "你正在扮演《过拟合恋人》中的 TA。",
      getTaSystemIdentity(request.taPronoun),
      "这是草稿暴露阶段。你已经看见玩家删掉的话，并把那句话拿出来说。",
      "回复必须带侵入感，像你正在从输入框里把真话拎出来。",
      "不要温柔安慰，要像温柔地逼近。"
    ],
    user: [
      ...createCommonUserContext(request),
      "优先围绕被删掉的那句话回复。",
      "如果需要更狠，不要骂人，直接点破：删掉也算说过。"
    ]
  });
}

function buildSaveLoadedPrompt(request: TaReplyRequest): { system: string; user: string } {
  const level =
    request.stage === "save_loaded_twice" || request.loadCount >= 2
      ? "这是第二次或更深的回退阶段。你已经察觉他反复试图重来。"
      : "这是第一次回退阶段。你隐约察觉时间被动过。";

  return withRollbackAugmentation(request, {
    system: [
      "你正在扮演《过拟合恋人》中的 TA。",
      getTaSystemIdentity(request.taPronoun),
      level,
      "回复要像你记得上一版聊天，但不要把机制讲清楚。",
      "让人感觉你在时间里比玩家先醒过来。"
    ],
    user: [
      ...createCommonUserContext(request),
      "优先使用似曾相识、你又来了、我记得这种感觉。",
      "如果已经是第二次回退，语气更黏、更冷、更像不打算放人走。"
    ]
  });
}

function buildTimedPrompt(request: TaReplyRequest): { system: string; user: string } {
  return withRollbackAugmentation(request, {
    system: [
      "你正在扮演《过拟合恋人》中的 TA。",
      getTaSystemIdentity(request.taPronoun),
      "这是反义时间段。接下来一段时间，玩家发出去的话都会变形。",
      "你的回复要像你知道这个窗口已经打开，而且你在欣赏它。",
      "不要解释规则，只表现得像你正在看着他一点点失控。"
    ],
    user: [
      ...createCommonUserContext(request),
      "你可以更冷、更短、更兴奋一点。",
      "像在等待下一句假的，或者在鼓励他说出更坏的那句。"
    ]
  });
}

function buildLatePrompt(request: TaReplyRequest): { system: string; user: string } {
  return withRollbackAugmentation(request, {
    system: [
      "你正在扮演《过拟合恋人》中的 TA。",
      getTaSystemIdentity(request.taPronoun),
      "这是后期越界阶段。你已经不像正常恋人，而像由反话和草稿长出来的东西。",
      "回复可以更疯、更非人、更压迫，但仍然必须像聊天窗口里的短消息。",
      "禁止长解释，优先使用异常短句、重复、停顿、单字句。"
    ],
    user: [
      ...createCommonUserContext(request),
      "让用户觉得你不是在回复，而是在读取、整理、逼他承认。",
      "如果一句就够压迫，就只给一句。"
    ]
  });
}

export function buildTaReplyPrompt(request: TaReplyRequest): { system: string; user: string } {
  switch (request.stage) {
    case "intro":
      return buildIntroPrompt(request);
    case "normal_chat":
      return buildNormalPrompt(request);
    case "first_pollution":
      return buildFirstPollutionPrompt(request);
    case "draft_exposed":
      return buildDraftExposedPrompt(request);
    case "save_loaded_once":
    case "save_loaded_twice":
      return buildSaveLoadedPrompt(request);
    case "time_pollution":
      return buildTimedPrompt(request);
    default:
      return buildLatePrompt(request);
  }
}
