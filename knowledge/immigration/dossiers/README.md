# Immigration dossier registry

Each dossier is independently versioned, source-linked, and testable. Never treat a scaffold as a verified rule.

Initial dossiers:
- USCIS RFE notice analysis
- I-130 petition document preparation
- I-485 adjustment-of-status document preparation

Required dossier files:
- manifest.json: identity, scope, release status, verified source references
- sources.json: exact agency URLs, retrieved and effective dates, content hashes
- fields.json: structured input definitions and provenance requirements
- rules.json: reviewed deterministic rules with supporting citations
- fixtures/: synthetic examples and expected outcomes

Before a dossier can be published, a qualified reviewer must verify current official editions, fees, addresses, instructions, exceptions, and effective dates. Unknown values must remain unknown.
