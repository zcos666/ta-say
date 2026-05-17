import {
  findBestSubtextMapping,
  legacyPollutionOverrides,
  resolveHardcodedPollutionText
} from "../../config/subtextMappings";

export interface PollutionRule {
  keyword: string;
  pollutedText: string;
}

export function findKeywordRule(input: string): PollutionRule | undefined {
  for (const keyword of Object.keys(legacyPollutionOverrides)) {
    if (input.includes(keyword)) {
      return {
        keyword,
        pollutedText: legacyPollutionOverrides[keyword]
      };
    }
  }

  const matched = findBestSubtextMapping(input);
  if (!matched) {
    return undefined;
  }

  return {
    keyword: matched.matchedAlias,
    pollutedText: resolveHardcodedPollutionText(matched)
  };
}
