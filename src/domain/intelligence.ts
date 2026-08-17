import type { Confidence, Deadline, CaseClaim, CaseConflict, CaseFact } from "./case.js";

export interface DocumentRequirement { id:string; description:string; required:boolean; sourceDocumentId:string; sourcePage?:number; confidence:Confidence; sourceQuote?:string; }
export interface DocumentIdentity { agency?:string; department?:string; noticeType?:string; referenceNumber?:string; issueDate?:string; receivedDate?:string; responseAddress?:string; }
export interface CaseIntelligence { identity:DocumentIdentity; facts:CaseFact[]; claims:CaseClaim[]; requirements:DocumentRequirement[]; deadlines:Deadline[]; conflicts:CaseConflict[]; unknowns:string[]; risks:string[]; }
export interface IntelligenceRun { id:string; caseId:string; status:"queued"|"running"|"completed"|"failed"; startedAt:string; completedAt?:string; sourceDocumentIds:string[]; intelligence?:CaseIntelligence; errors:string[]; }
