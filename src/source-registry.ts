import { sources } from "./catalog";

export type SourceRecord = {
  id: string;
  agency: string;
  title: string;
  url: string;
  retrievedAt: string | null;
  contentHash: string | null;
  effectiveAt: string | null;
  reviewStatus: "directory_only" | "pending_review" | "verified" | "superseded";
};
export type Citation = { sourceId: string; passage: string; snapshotHash: string };
export type CitationResult = { valid: boolean; errors: string[] };
export const registry: SourceRecord[] = sources.map(s => ({
  ...s, retrievedAt: null, contentHash: null, effectiveAt: null,
  reviewStatus: "directory_only"
}));
export function validateCitation(citation: Citation, entries: readonly SourceRecord[] = registry): CitationResult {
  const errors: string[] = [];
  const source = entries.find(s => s.id === citation.sourceId);
  if (!source) errors.push("unknown_source");
  else {
    if (source.reviewStatus !== "verified") errors.push("source_not_verified");
    if (!source.contentHash || source.contentHash !== citation.snapshotHash) errors.push("snapshot_mismatch");
  }
  if (!citation.passage?.trim()) errors.push("missing_passage");
  return { valid: errors.length === 0, errors };
}
export function publishableClaim(citations: Citation[], entries: readonly SourceRecord[] = registry): boolean {
  return citations.length > 0 && citations.every(c => validateCitation(c, entries).valid);
}
