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
  | "location_reveal"
  | "location_aftermath"
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
  | "exit_blocked"
  | "location_ping";
export const ENTRANCE_STAGE: StoryStage = "translator_unlocked";
