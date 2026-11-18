# Immigration Expert Engine

Fresh standalone implementation in the gov-reply repository. This project is independent of MailMyPDF. No real immigration filings, legal advice, payments, or mailings are performed.

## Run locally
```bash
npm install
npm test
npm run typecheck
npm run dev
```

The Cloudflare Worker serves a static responsive interface and read-only source catalog. API endpoints provide official source discovery, dossier metadata, and deterministic clerical consistency checks. No uploaded identity documents are persisted.

## API
- GET /api/health
- GET /api/sources
- GET /api/dossiers
- POST /api/validate (JSON with `facts` object)

The official source registry is a directory, **not** a claim that current editions, fees, or eligibility rules have been verified. Check official pages before filing.

## Next milestones
Secure authentication and tenant-isolated case storage; sandboxed document parsing; source snapshots and citation provenance; reviewed form versions; professional credential verification; PDF packet previews and immutable approvals; independent legal/security review.

Do not use this prototype for live case handling.
