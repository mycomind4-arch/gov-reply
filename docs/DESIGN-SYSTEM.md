# GovReply design system

The UI follows the approved dashboard mockup: white top navigation, blue gradient hero, purple actions, rounded pale cards, four shortcut tiles, journey steps, task grid, audience toggle and official source footer.

Reusable frontend primitives are in `public/components.js`: layout, pageHeader, card, notice, button, tile, sourceStrip and escapeHTML. Page composition is in `public/pages.js`; shared interaction and API loading in `public/app.js`; tokens/responsive styling in `public/styles.css`.

Routes: /, /expert, /forms, /cases, /professionals, /sources. These are served as a client-rendered shell; configure Cloudflare static asset SPA fallback for deep-link support before deployment.

This is a visual and navigation implementation. It does not represent completed legal research, form filing, secure uploads, case storage or professional authorization. Mockup copy that could imply verification is replaced by accurate status language.
