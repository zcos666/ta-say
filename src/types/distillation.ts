export type ConversationSpeaker = "self" | "other";

export interface ConversationMessage {
  speaker: ConversationSpeaker;
  content: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface DistilledEvidence {
  quote: string;
  reason: string;
}

interface DistilledProfileBase {
  summary: string;
  styleTags: string[];
  emotionalTraits: string[];
  communicationHabits: string[];
  interactionPreferences: string[];
  relationshipSignals: string[];
  evidence: DistilledEvidence[];
}

export interface SelfProfile extends DistilledProfileBase {
  subject: "self";
}

export interface OtherProfile extends DistilledProfileBase {
  subject: "other";
}
