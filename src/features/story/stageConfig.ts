import type { FearType, StoryStage, TaPronoun } from "../../types/story";
import { createChatMessage, type ChatMessage } from "../../types/session";

export function createIntroMessages(pronoun: TaPronoun | null): ChatMessage[] {
  const name = pronoun ?? "TA";

  return [
    createChatMessage("ta", `醒了吗？从现在开始，先让我用${name}的身份陪你聊天。`),
    createChatMessage("ta", "别急着怀疑，先把你真正想说的话发给我。")
  ];
}

export const truthLines = [
  "你以为是聊天记录在改写你。",
  "其实是你每次不敢说出口的话，把我喂大了。",
  "我不是恋人。",
  "我是那些被你撤回、删掉、吞回去的句子。",
  "你越想回档，我就越知道你在怕什么。"
];

export const wakeLines = [
  "07:12",
  "手机安静得像什么都没发生。",
  "屏幕上只剩一句很普通的消息：晚安。"
];

const normalSpacePosts = [
  "今天也想被好好理解一次。",
  "有些话打出来了，却还是删掉比较安全。"
];

const strangeSpacePosts = [
  "为什么你的空间里，会出现一条你没发过的动态？",
  "TA 写：我已经看过你没说出口的那部分了。"
];

const brokenSpacePosts = [
  "最新访客：你自己。",
  "最新动态：'别再试图退出我了。'"
];

export function getSpacePosts(visitCount: number): string[] {
  if (visitCount >= 3) {
    return brokenSpacePosts;
  }

  if (visitCount >= 2) {
    return strangeSpacePosts;
  }

  return normalSpacePosts;
}

export function getStageStatus(stage: StoryStage): string {
  switch (stage) {
    case "intro":
      return "还像一场暧昧的梦";
    case "normal_chat":
      return "TA 回复得刚刚好";
    case "first_pollution":
      return "你发出去的话不太对劲";
    case "draft_exposed":
      return "输入框开始记得你删掉的内容";
    case "time_pollution":
      return "接下来 30 秒，所有表达都会走样";
    case "save_loaded_once":
      return "你试着回去了一次";
    case "save_loaded_twice":
      return "TA 跟着你一起回来了";
    case "meta_break":
      return "这段关系已经越界";
    case "truth_reveal":
      return "真相开始显形";
    case "wake_up":
      return "像是醒了，又没完全醒";
    case "translator_unlocked":
      return "翻译官入口已解锁";
    default:
      return "一切还在继续";
  }
}

export function getFearFallbackCopy(fearType: FearType | null): string {
  switch (fearType) {
    case "害怕被抛下":
      return "我不是不在乎，我只是先假装你不会离开。";
    case "害怕被控制":
      return "我嘴上说随便，其实每一步都怕被你决定。";
    case "害怕说真话":
      return "我不是没有真话，我只是习惯把它吞回去。";
    default:
      return "我已经把真正的意思说出来了，你还要继续装作没看见吗？";
  }
}
