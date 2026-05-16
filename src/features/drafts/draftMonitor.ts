import { SENSITIVE_DRAFT_HINTS } from "../../config/keywords";

const MIN_DRAFT_LENGTH = 4;

export function captureDeletedDraft(previousValue: string, nextValue: string): string | null {
  const prev = previousValue.trim();
  const next = nextValue.trim();

  if (!prev || prev.length < MIN_DRAFT_LENGTH || next.length >= prev.length) {
    return null;
  }

  const looksSensitive = SENSITIVE_DRAFT_HINTS.some((hint) => prev.includes(hint));

  if (!looksSensitive) {
    return null;
  }

  return prev;
}
