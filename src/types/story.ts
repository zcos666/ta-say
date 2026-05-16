export type FearType = "害怕被抛下" | "害怕被控制" | "害怕说真话";
export type TaPronoun = "他" | "她" | "TA";
export type StoryStage =
  | "start"
  | "intro"
  | "normal_chat"
  | "first_pollution"
  | "draft_exposed"
  | "time_pollution"
  | "save_loaded_once"
  | "save_loaded_twice"
  | "meta_break"
  | "truth_reveal"
  | "wake_up"
  | "translator_unlocked"
  | "share_ready";

export type TriggerReason = "count" | "keyword" | "timed" | "scripted";

export type StoryEvent =
  | "draft_exposed"
  | "load_restored"
  | "load_warning"
  | "load_failed"
  | "space_glitch"
  | "exit_blocked";
