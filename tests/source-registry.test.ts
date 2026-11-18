import { describe, expect, it } from "vitest";
import { registry, publishableClaim, validateCitation, type SourceRecord } from "../src/source-registry";

describe("official source registry safety", () => {
  it("does not treat directory links as verified claims", () => {
    expect(registry.length).toBeGreaterThan(0);
    expect(registry.every(s => s.reviewStatus === "directory_only")).toBe(true);
    expect(publishableClaim([{sourceId:"uscis-forms", passage:"sample", snapshotHash:"abc"}])).toBe(false);
  });
  it("rejects unknown sources", () => {
    expect(validateCitation({sourceId:"unknown", passage:"text", snapshotHash:"abc"}).errors).toContain("unknown_source");
  });
  it("rejects empty passages", () => {
    expect(validateCitation({sourceId:"uscis-forms", passage:"", snapshotHash:"abc"}).errors).toContain("missing_passage");
  });
  it("requires matching verified snapshot", () => {
    const verified: SourceRecord[] = [{...registry[0], reviewStatus:"verified", contentHash:"sha256:123"}];
    expect(validateCitation({sourceId:verified[0].id, passage:"Official excerpt", snapshotHash:"sha256:wrong"}, verified).valid).toBe(false);
    expect(validateCitation({sourceId:verified[0].id, passage:"Official excerpt", snapshotHash:"sha256:123"}, verified).valid).toBe(true);
  });
  it("does not publish claims without citations", () => expect(publishableClaim([])).toBe(false));
});
