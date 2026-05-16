export type StoryStage =
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

export const ENTRANCE_STAGE: StoryStage = "translator_unlocked";
