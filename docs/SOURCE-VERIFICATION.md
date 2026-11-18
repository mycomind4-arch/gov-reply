# Source verification protocol

The source catalog is a directory, not a collection of authenticated government snapshots. It must not be cited as evidence of current fees, editions, addresses, deadlines, or eligibility.

To promote a source to verified:
1. Retrieve an official agency page or document through an approved fetcher.
2. Record retrieval time, canonical URL, content hash, publication and effective dates where available.
3. Preserve a readable immutable snapshot and the exact supporting passage.
4. Obtain human review for legally consequential requirements.
5. Publish a signed version of the source registry and execute regression tests.
6. Invalidate affected rules and drafts when a source changes.

Citation validation is intentionally fail-closed. This first implementation validates metadata only; it does not yet verify that the passage is actually contained in the snapshot. That must be added before source-backed legal claims can be shown to users.

Never invent an extraction date, hash, or verified status.
