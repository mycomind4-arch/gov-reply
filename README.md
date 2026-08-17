# GovReply

**Understand government correspondence. Know what you need to do. Build the right response. Preserve proof.**

GovReply is a MailMyPDF ecosystem vertical for analyzing government correspondence, organizing facts and evidence, identifying response deadlines, developing response strategies, preparing professional responses, and preserving submission proof.

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

## Core workflow

`RECEIVE → UNDERSTAND → EXTRACT → DEADLINES → EVIDENCE → CONFLICTS → STRATEGY → RESPONSE → REVIEW → PROOF → SUBMIT → TRACK`

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
