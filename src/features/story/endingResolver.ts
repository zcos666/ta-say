import type { SessionState } from "../../types/session";

export function resolveEndingType(session: SessionState): string {
  if (session.loadCount >= 3) {
    return "记忆回读型结局";
  }

  if (session.deletedDraftCount >= 2) {
    return "真话暴露型结局";
  }

  if (session.pollutionCount >= 3) {
    return "语言失真型结局";
  }

  return "普通梦醒型结局";
}
