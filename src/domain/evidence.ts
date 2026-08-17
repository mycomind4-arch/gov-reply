export type EvidenceKind = "document" | "payment_record" | "correspondence" | "image" | "receipt" | "tracking" | "other";

export type EvidenceStatus = "unreviewed" | "supported" | "contradictory" | "insufficient" | "excluded";

export interface EvidenceItem {
  id: string;
  caseId: string;
  title: string;
  kind: EvidenceKind;
  description?: string;
  sourceDocumentId?: string;
  page?: number;
  status: EvidenceStatus;
  confidence: "high" | "medium" | "low" | "unknown";
  hash?: string;
  uploadedAt: string;
}

export interface EvidenceLink {
  evidenceId: string;
  claimId: string;
  relationship: "supports" | "contradicts" | "context";
  explanation?: string;
}

export interface EvidenceCompleteness {
  requiredEvidence: string[];
  presentEvidenceIds: string[];
  missingEvidence: string[];
  unresolvedConflicts: string[];
  complete: boolean;
}
