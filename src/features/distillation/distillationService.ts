import { llmClient } from "../../services/api/llmClient";
import { requestDistillOther, requestDistillSelf } from "../../services/api/distillApi";
import type { ConversationMessage, DistilledEvidence, OtherProfile, SelfProfile } from "../../types/distillation";
import { normalizeConversationInput } from "./conversationNormalizer";

export interface DistillProfileInput {
  conversation: string | ConversationMessage[];
}

type DistillationTarget = "self" | "other";
type DistilledProfile = SelfProfile | OtherProfile;

const MAX_TAG_COUNT = 6;
const MAX_EVIDENCE_COUNT = 3;

function sanitizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((entry) => sanitizeText(entry)).filter(Boolean))].slice(0, MAX_TAG_COUNT);
}

function sanitizeEvidence(value: unknown): DistilledEvidence[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const quote = sanitizeText((entry as { quote?: unknown }).quote);
      const reason = sanitizeText((entry as { reason?: unknown }).reason);

      if (!quote || !reason) {
        return null;
      }

      return { quote, reason };
    })
    .filter((entry): entry is DistilledEvidence => entry !== null)
    .slice(0, MAX_EVIDENCE_COUNT);
}

export function sanitizeDistilledProfile(
  target: DistillationTarget,
  payload: unknown,
): DistilledProfile {
  if (!payload || typeof payload !== "object") {
    throw new Error("蒸馏结果为空或格式错误。");
  }

  const summary = sanitizeText((payload as { summary?: unknown }).summary);
  const styleTags = sanitizeStringList((payload as { styleTags?: unknown }).styleTags);
  const emotionalTraits = sanitizeStringList((payload as { emotionalTraits?: unknown }).emotionalTraits);
  const communicationHabits = sanitizeStringList(
    (payload as { communicationHabits?: unknown }).communicationHabits,
  );
  const interactionPreferences = sanitizeStringList(
    (payload as { interactionPreferences?: unknown }).interactionPreferences,
  );
  const relationshipSignals = sanitizeStringList(
    (payload as { relationshipSignals?: unknown }).relationshipSignals,
  );
  const evidence = sanitizeEvidence((payload as { evidence?: unknown }).evidence);

  if (!summary) {
    throw new Error("蒸馏结果缺少 summary。");
  }

  if (
    styleTags.length === 0 &&
    emotionalTraits.length === 0 &&
    communicationHabits.length === 0 &&
    interactionPreferences.length === 0 &&
    relationshipSignals.length === 0
  ) {
    throw new Error("蒸馏结果缺少可复用画像字段。");
  }

  return {
    subject: target,
    summary,
    styleTags,
    emotionalTraits,
    communicationHabits,
    interactionPreferences,
    relationshipSignals,
    evidence,
  } as DistilledProfile;
}

async function requestProfileFromApi(target: DistillationTarget, conversation: ConversationMessage[]) {
  if (target === "self") {
    return requestDistillSelf({ conversation });
  }

  return requestDistillOther({ conversation });
}

async function requestProfileFromLlm(target: DistillationTarget, conversation: ConversationMessage[]) {
  if (target === "self") {
    return llmClient.distillSelf(conversation);
  }

  return llmClient.distillOther(conversation);
}

async function distillProfile(target: DistillationTarget, input: DistillProfileInput) {
  const conversation = normalizeConversationInput(input.conversation);
  let lastError: unknown;

  try {
    const apiResult = await requestProfileFromApi(target, conversation);
    return sanitizeDistilledProfile(target, apiResult);
  } catch (error) {
    lastError = error;
  }

  try {
    const llmResult = await requestProfileFromLlm(target, conversation);
    if (!llmResult) {
      throw new Error("LLM 蒸馏结果为空。");
    }
    return sanitizeDistilledProfile(target, llmResult);
  } catch (error) {
    lastError = error;
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error("蒸馏服务暂不可用。");
}

export async function distillSelfProfile(input: DistillProfileInput): Promise<SelfProfile> {
  return distillProfile("self", input) as Promise<SelfProfile>;
}

export async function distillOtherProfile(input: DistillProfileInput): Promise<OtherProfile> {
  return distillProfile("other", input) as Promise<OtherProfile>;
}
