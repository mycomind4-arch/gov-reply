# Vertical Ship Skill

Ship a vertical end to end.

1. Run repository audit.
2. Run typecheck/build validation.
3. Run security checks for uploads, prompt injection, secrets and consequential actions.
4. Test the complete happy path and failure paths.
5. Deploy to Cloudflare using the ecosystem's existing deployment pattern.
6. Verify health, static assets and API endpoints after deployment.
7. Record deployment URL, commit SHA, test results and any required secrets/configuration.
8. Do not claim production deployment succeeded unless the live deployment has actually been verified.

For Cloudflare Pages, use the existing MailMyPDF Platform deployment convention and GitHub Actions secrets rather than inventing a new deployment mechanism. For Workers/Workers AI, use wrangler.jsonc, a current compatibility date and explicit AI bindings.
