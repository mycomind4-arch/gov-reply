# Immigration Expert Engine — Architecture v0.1

## Goal
Extend GovReply with a source-grounded US immigration paperwork engine for consumers and authorized professionals. Preserve the existing government-correspondence workflow and Cloudflare Workers deployment model. This branch is not production enabled.

## Roles and legal boundary
- Consumer: general official instructions, user-directed clerical form filling, document extraction, consistency checks, and draft packet previews. No individualized legal strategy or eligibility decisions.
- Professional: case-specific research and proposed analyses, subject to verification of attorney or DOJ-accredited representative credentials, scope, and human approval.
- Administrator: system configuration, never implicit case access.
- Every endpoint and MCP tool must independently authorize tenant, case, role, and action. Client-side restrictions are insufficient.

## Components
1. Existing GovReply web UI and /api/analyze boundary.
2. Immigration source registry: agency, URL, retrieval time, published/effective dates, hash, and source passages.
3. Versioned dossier registry: form editions, field definitions, rules, exceptions, citations, test fixtures.
4. Document intake: quarantine, magic-byte validation, scanning, bounded extraction, source-page provenance, conflicting facts.
5. Rule evaluator: deterministic clerical checks; consequential legal rules require expert approval.
6. Packet renderer: exact form version, reviewable drafts, attachments, manifest, hashes, immutable approvals.
7. Review service: professional credential scope, case assignment, approvals tied to exact packet hash.
8. MCP adapter: read-only research first, later authenticated case-scoped draft tools.

## Cloudflare-aligned implementation
- TypeScript Worker for HTTP API and authorization.
- Cloudflare D1 or external PostgreSQL for transactional metadata, chosen after current persistence audit.
- R2 for encrypted document objects with signed short-lived access and retention policy.
- Queues for asynchronous document analysis; use sandboxed external processing for risky PDF/DOCX/OCR workloads.
- Model adapter behind the existing /api/analyze interface; retrieved text is untrusted data.
- Separate source ingestion and approval pipelines. Never silently publish changed fees, addresses, editions, or deadline logic.

## Core entities
organizations, users, memberships, professional_credentials, cases, case_parties,
documents, document_versions, case_facts, fact_sources, fact_conflicts,
knowledge_sources, source_versions, dossiers, rule_versions,
form_definitions, form_instances, packet_versions, approvals, audit_events, jobs.

All case entities carry tenant IDs. All extracted facts retain document/page provenance and verification state. Preserve source snapshots and rule effective dates.

## Initial API contracts (planned, not implemented)
GET /api/immigration/sources
POST /api/immigration/research
POST /api/immigration/cases
POST /api/immigration/cases/:id/documents
POST /api/immigration/notices/analyze
POST /api/immigration/forms/:formId/drafts
POST /api/immigration/forms/drafts/:id/validate
POST /api/immigration/packets/:id/request-review
POST /api/immigration/packets/:id/approve

## Invariants
- No invented source citations, deadlines, eligibility findings, fee values, or government submission outcomes.
- No filing, mailing, or charging without separate explicit authorization and verified integration.
- No cross-tenant data access or unauthorized professional mode.
- No promotion of AI extraction to verified case facts without review.
- No approval reuse after any packet byte changes.
- No production claims before tests, legal review, and security review.

## Incremental implementation sequence
1. Audit existing Worker routes, auth, persistence, tests and deployment configuration.
2. Add read-only, versioned source registry with provenance tests.
3. Add consumer/professional authorization boundaries with denial tests.
4. Add secure document intake and notice extraction with fictional fixtures.
5. Add deterministic form rules and packet generation.
6. Add professional review, immutable approvals, and MCP adapters.
7. Complete adversarial, privacy, accessibility, and legal review before pilot.
