# Existing PDF field filler

At /fill-pdf, users can load an existing PDF locally and detect AcroForm fields. The browser bundle uses pdf-lib and does not send uploaded PDF bytes to the Worker.

Text fields and checkboxes can be edited; other field types are detected but left unchanged by the UI. The lower-level API supports dropdowns and radio groups but requires allowed option values. The editor does not flatten fields, validate official USCIS editions, validate legal correctness, perform OCR, or submit filings.

The source PDF is never overwritten. Limit: 15 MB. This is a generic fillable PDF tool, not an official USCIS form mapping. Always check official form editions and instructions separately.
