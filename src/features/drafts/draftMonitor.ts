const MIN_DELETED_LENGTH = 3;

function extractDeletedSegment(previousValue: string, nextValue: string): string {
  let prefixLength = 0;
  const maxPrefix = Math.min(previousValue.length, nextValue.length);

  while (
    prefixLength < maxPrefix &&
    previousValue[prefixLength] === nextValue[prefixLength]
  ) {
    prefixLength += 1;
  }

  let previousSuffixIndex = previousValue.length - 1;
  let nextSuffixIndex = nextValue.length - 1;

  while (
    previousSuffixIndex >= prefixLength &&
    nextSuffixIndex >= prefixLength &&
    previousValue[previousSuffixIndex] === nextValue[nextSuffixIndex]
  ) {
    previousSuffixIndex -= 1;
    nextSuffixIndex -= 1;
  }

  return previousValue.slice(prefixLength, previousSuffixIndex + 1).trim();
}

export function captureDeletedDraft(previousValue: string, nextValue: string): string | null {
  const prev = previousValue.trim();
  const next = nextValue.trim();

  if (!prev || next.length >= prev.length) {
    return null;
  }

  const deletedSegment = extractDeletedSegment(previousValue, nextValue);

  if (deletedSegment.length < MIN_DELETED_LENGTH) {
    return null;
  }

  return deletedSegment;
}
