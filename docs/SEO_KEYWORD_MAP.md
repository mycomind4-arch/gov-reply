# GovReply SEO Keyword Map

## Strategy

GovReply should own **government correspondence and official-letter response** intent, especially situation-specific agency searches. Broad "government letter" terms are sparse; agency/action-specific pages are the stronger acquisition path.

## Priority clusters

### IRS / tax
- IRS notice
- IRS letter response
- response to IRS notice
- reply to IRS letter
- CP14
- CP2000
- CP504
- notice of deficiency
- notice of levy

### Government correspondence
- respond to government notice
- government notice response
- government letter response
- agency action response
- request for response to government letter

### Agency-specific expansion
Build dedicated workflows for high-intent notices surfaced by search research, while keeping the generic government-notice workflow as the master entry point.

## Recommended architecture

GovReply
├── IRS / tax notices
├── DMV / state agencies
├── Social Security / benefits
├── immigration / federal agencies
├── local government notices
└── general government letter response

## Rule

Do not publish shallow pages for every agency name. Each page should explain the notice/problem, identify the user action, list relevant documents, and hand off to an actual response workflow.