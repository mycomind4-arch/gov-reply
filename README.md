# GovReply

**Understand government correspondence. Know what you need to do. Build the right response. Preserve proof.**

GovReply is a MailMyPDF ecosystem vertical for analyzing government correspondence, organizing facts and evidence, identifying response deadlines, developing response strategies, preparing professional responses, and preserving submission proof.

## Current product

The first product slice is intentionally focused rather than overbuilt:

`RECEIVE → UNDERSTAND → DEADLINE → EVIDENCE → STRATEGY → RESPONSE → REVIEW → PROOF`

The UI is a polished case workspace with a source-grounded analysis endpoint and a response-review workflow. Text documents can be sent to `/api/analyze`; PDFs are reserved for the shared MailMyPDF document-extraction boundary so page-level provenance is not faked in the vertical.

## AI quality bar

Analysis is structured around:

- document identity
- plain-English explanation
- requested actions
- explicit deadlines and their source language
- source-backed facts
- unknowns
- warnings and conflicts
- response strategy
- professional response draft
- review checks

The AI prompt explicitly forbids invented facts, deadlines, statutes, procedural rights, or claims of compliance. AI interpretations remain reviewable rather than silently becoming verified facts.

## Architecture

GovReply is intentionally a **vertical application**, not a second platform. It consumes reusable MailMyPDF Platform capabilities and keeps government-correspondence-specific intelligence here.

### Reuse from MailMyPDF Platform

- structured document intelligence
- evidence/provenance primitives
- timeline/event primitives
- AI orchestration boundaries
- workflow contracts
- validation and QA patterns
- ecosystem identity/entitlement contracts
- proof and fulfillment integration boundaries
- shared design-system patterns
- security boundaries

### GovReply owns

- government correspondence taxonomy
- notice/letter requirement extraction
- deadline interpretation and presentation
- case facts, claims, unknowns, and conflicts
- government-response strategies
- response types and guided response workflows
- domain-specific prompts and validators
- GovReply case workspace and UX

## Cloudflare

GovReply is configured as a Cloudflare Worker with static assets and a Workers AI binding. The current AI implementation uses Cloudflare's `@cf/openai/gpt-oss-20b` model for the first production slice; the model is isolated behind the `/api/analyze` boundary so the platform can later provide provider-neutral routing.

GitHub Actions deployment expects these repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The deployment workflow runs `wrangler deploy` on pushes to `main`.

## Skills

Reusable end-to-end vertical skills live in `skills/`:

- `vertical-audit` — audit platform reuse and establish boundaries
- `vertical-ai` — build source-grounded analysis and response generation safely
- `vertical-product` — build a focused, polished vertical workflow
- `vertical-ship` — validate, deploy and verify a vertical

## Safety and trust principles

- Uploaded documents are untrusted input.
- AI output is never silently promoted to a verified fact.
- Every important extracted fact retains provenance.
- Uncertain deadlines are explicitly labeled as uncertain.
- Consequential actions such as mailing require explicit authorization.
- GovReply does not present itself as a substitute for legal counsel.

## Development

This repository is being built incrementally against the reusable contracts in `mycomind4-arch/mailmypdf-platform`.

No sub-agents are used for implementation.
