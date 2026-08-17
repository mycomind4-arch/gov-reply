export type ResponseType =
  | "notice_response"
  | "document_submission"
  | "factual_correction"
  | "extension_request"
  | "clarification_request"
  | "reconsideration_request"
  | "administrative_review"
  | "appeal"
  | "compliance_response"
  | "general_correspondence";

export interface ResponseStrategy {
  objective: string;
  responseType: ResponseType;
  requiredActions: string[];
  evidenceIds: string[];
  openQuestions: string[];
  risks: string[];
  rationale: string;
}

export interface ResponseCheck {
  id: string;
  label: string;
  status: "pass" | "warning" | "fail" | "not_checked";
  detail?: string;
}

export interface ResponseReview {
  checks: ResponseCheck[];
  ready: boolean;
  blockingIssues: string[];
}

export interface GovReplyResponse {
  id: string;
  caseId: string;
  type: ResponseType;
  strategy: ResponseStrategy;
  body: string;
  evidenceIds: string[];
  review?: ResponseReview;
  status: "draft" | "review" | "ready" | "submitted";
}
