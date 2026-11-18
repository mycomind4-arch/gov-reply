# Browser PDF creator

The document editor is available at /documents. It uses the MIT-licensed pdf-lib library (https://github.com/Hopding/pdf-lib) to generate multi-page, letter-sized PDFs in the browser. The package is bundled into public/pdf-editor.bundle.js by npm run build:client, which is also part of the dev/build/deploy scripts.

The generated bundle is a build artifact, not checked into source control. No server upload, case storage, filing, payment, or professional approval occurs. The browser preview uses its native PDF viewer. Fonts currently use PDF standard Helvetica; unsupported Unicode characters are replaced with '?' rather than silently causing a broken document. A future release should embed licensed Unicode fonts and add PDF.js preview.

Before production: add comprehensive tests, Unicode handling, accessibility checks, print pagination review, CSP, secure case storage and independent legal/security review. Official USCIS form filling is not implemented.
