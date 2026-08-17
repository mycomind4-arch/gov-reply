# GovReply Platform Reuse Map

This document is the architectural gate for the vertical.

## Reuse matrix

| Capability | Owner | GovReply use |
|---|---|---|
| Identity / account | MailMyPDF ecosystem | Consume; never duplicate |
| Entitlements / usage | MailMyPDF ecosystem | Consume |
| Document ingestion | Platform | Consume |
| Structured extraction | Platform | Extend through vertical schemas |
| AI orchestration | Platform | Consume |
| Evidence/provenance | Platform | Consume |
| Event/timeline primitives | Platform | Consume |
| Workflow contracts | Platform | Consume |
| Proof / fulfillment boundary | Platform + MailMyPDF | Consume |
| Government taxonomy | GovReply | Own |
| Requirement extraction schema | GovReply | Own |
| Deadline interpretation | GovReply | Own domain logic; use platform extraction primitives |
| Case intelligence | GovReply | Own domain model built on platform primitives |
| Contradiction detection | GovReply | Own domain rules + structured AI |
| Response strategy | GovReply | Own |
| Response builder | GovReply | Own |
| GovReply UI | GovReply | Own, using shared design patterns |

## Hard boundary

If a new capability is useful to multiple verticals, first evaluate whether it belongs in MailMyPDF Platform. Do not copy platform code into GovReply merely because it is convenient.

If a capability only makes sense for government correspondence, it belongs here.

## Trust model

Every case intelligence object should be classifiable as one of:

- `source_fact` — directly established by a source document
- `user_fact` — explicitly supplied by the user
- `derived_fact` — deterministic derivation from trusted inputs
- `ai_interpretation` — model interpretation requiring review
- `unknown` — intentionally unresolved

No `ai_interpretation` may silently become `source_fact`.

## Consequential actions

Generation is reversible. Mailing/submission is consequential.

The UI must therefore separate:

1. prepare
2. review
3. authorize
4. submit
5. reconcile proof

Production mailing must remain explicitly gated.
