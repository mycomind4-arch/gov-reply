# Vertical AI Skill

Build AI workflows around structured, reviewable outputs rather than chat-first generation.

For document analysis:
- classify the document
- extract entities, dates, deadlines, requirements and claims
- attach source quotes/page references whenever available
- distinguish source facts, user facts, deterministic derivations, AI interpretations and unknowns
- preserve confidence separately from provenance
- detect conflicts and evidence gaps
- never promote AI interpretation to verified fact automatically

For response generation:
- establish the objective and response type first
- use only verified facts and explicitly supplied user facts
- avoid unsupported legal conclusions, admissions or claims of compliance
- preserve uncertainty where the record is incomplete
- run deterministic validation plus AI review before marking ready
- surface every blocking issue to the user

Prompts should be versioned, tested against adversarial examples, and designed to fail safely when source text is incomplete or contradictory.
