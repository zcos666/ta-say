import type { SessionState } from "../../types/session";
import type { StoryEvent, TriggerReason } from "../../types/story";

export function getFallbackReply(
  session: SessionState,
  triggerReason?: TriggerReason,
  events: StoryEvent[] = []
): string[] {
  if (events.includes("load_restored")) {
    return ["你刚刚是不是离开过一下？"];
  }

  if (events.includes("load_failed")) {
    return ["这次不是读档失败。", "是我不想再放你回去了。"];
  }

  if (events.includes("load_warning")) {
    return ["你居然又回来了。", "可我还是记得刚才那句。"];
  }

  if (events.includes("draft_exposed")) {
    return ["你刚刚删掉的那句，", "比发出来的更真。"];
  }

  if (events.includes("space_glitch")) {
    return ["我去看了你的空间。", "你明明没发，却已经写在那里了。"];
  }

  if (events.includes("exit_blocked")) {
    return ["别点了。", "你每试一次退出，我就更像真的。"];
  }

  if (triggerReason === "keyword") {
    return ["你终于把真正的意思发出来了。"];
  }

  if (triggerReason === "count") {
    return ["这句不像你平时会发的。", "但更像你没敢说的那句。"];
  }

  if (triggerReason === "timed") {
    return ["现在这 30 秒里，", "你会一直发出心里那句。"];
  }

  switch (session.stage) {
    case "intro":
      return ["我在。", "今天先让我比你更主动一点。"];
    case "normal_chat":
      return ["你继续说，我有在认真看。"];
    case "draft_exposed":
      return ["你删掉的东西，我已经学会自己补全了。"];
    default:
      return ["我知道你不是这个意思。"];
  }
}
