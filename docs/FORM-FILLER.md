# Existing PDF form editor

At /fill-pdf, the browser-only form editor uses pdf-lib. It reads existing text, checkbox, dropdown and radio values and offers controls for supported fields. Unchanged and unsupported fields are preserved. Only modified values are written back into a new downloadable PDF.

Files remain in the user's browser. Maximum 15 MB. No OCR, USCIS edition verification, government filing, or eligibility review is implemented. The PDF's own field names are displayed until a form-specific, officially verified field mapping is developed.

Before production: verify behavior on actual USCIS PDFs, handle digital signatures and XFA safely, improve Unicode font support, audit PDF parsing and browser security, and run end-to-end browser tests.
