export type Confidence = "high" | "medium" | "low" | "unknown";

export type ProvenanceKind =
  | "source_fact"
  | "user_fact"
  | "derived_fact"
  | "ai_interpretation"
  | "unknown";

export interface Provenance {
  kind: ProvenanceKind;
  sourceDocumentId?: string;
  sourcePage?: number;
  sourceQuote?: string;
  explanation?: string;
}

export interface CaseFact {
  id: string;
  label: string;
  value: string;
  confidence: Confidence;
  provenance: Provenance;
  verified: boolean;
}

export interface Deadline {
  id: string;
  label: string;
  date?: string;
  trigger?: string;
  calculation?: string;
  confidence: Confidence;
  explicit: boolean;
  sourceDocumentId?: string;
  sourcePage?: number;
  status: "upcoming" | "due" | "past" | "uncertain";
}

export interface CaseClaim {
  id: string;
  statement: string;
  source: "agency" | "user" | "derived";
  confidence: Confidence;
  evidenceIds: string[];
}

export interface CaseConflict {
  id: string;
  title: string;
  leftClaimId: string;
  rightClaimId: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "resolved" | "dismissed";
  recommendedAction?: string;
}

export interface GovReplyCase {
  id: string;
  title: string;
  agency?: string;
  noticeType?: string;
  referenceNumber?: string;
  createdAt: string;
  updatedAt: string;
  facts: CaseFact[];
  claims: CaseClaim[];
  deadlines: Deadline[];
  conflicts: CaseConflict[];
  status: "intake" | "analysis" | "strategy" | "drafting" | "review" | "ready" | "submitted" | "closed";
}
