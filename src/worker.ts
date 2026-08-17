interface AI { run(model: string, input: unknown): Promise<unknown>; }
interface Env { AI: AI; ASSETS: { fetch(request: Request): Promise<Response> }; }

const SYSTEM = `You are GovReply's government-correspondence analysis engine. Analyze only the supplied document text. Never invent facts, dates, statutes, deadlines, agency requirements, or procedural rights. Separate source facts from interpretation. Every extracted item must include a source quote. If the document does not establish something, return unknown. Do not give legal advice. Your job is to explain the document, identify concrete requested actions, identify explicit deadlines, surface contradictions or missing information, propose a cautious response strategy, and draft a professional factual response using only verified facts supplied by the document/user. A draft must never claim compliance that the record does not establish.`;

const SCHEMA = `Return ONLY valid JSON with this shape:
{"document":{"agency":string|null,"department":string|null,"noticeType":string|null,"referenceNumber":string|null,"issueDate":string|null,"receivedDate":string|null},"plainEnglishSummary":string,"whatTheyWant":[{"action":string,"required":boolean,"sourceQuote":string}],"deadlines":[{"label":string,"date":string|null,"period":string|null,"trigger":string|null,"explicit":boolean,"confidence":"high"|"medium"|"low"|"unknown","sourceQuote":string}],"facts":[{"label":string,"value":string,"confidence":"high"|"medium"|"low"|"unknown","sourceQuote":string}],"unknowns":[string],"warnings":[{"title":string,"detail":string,"severity":"high"|"medium"|"low"}],"strategy":{"responseType":string,"objective":string,"steps":[string],"evidenceNeeded":[string],"risks":[string]},"responseDraft":string,"review":[{"label":string,"status":"pass"|"warning"|"fail","detail":string}]}`;

function fallback(text:string){
  const date = text.match(/\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}\b/i)?.[0] ?? null;
  const period = text.match(/\b\d{1,3}\s+(?:calendar\s+|business\s+)?days?\b/i)?.[0] ?? null;
  const ref = text.match(/\b(?:case|reference|ref\.?|notice)\s*(?:number|no\.?|#)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9-]{3,})/i)?.[1] ?? null;
  return {document:{agency:null,department:null,noticeType:null,referenceNumber:ref,issueDate:date,receivedDate:null},plainEnglishSummary:"The document was received, but AI analysis is not currently available. Review the source document directly and do not rely on an inferred deadline.",whatTheyWant:[],deadlines:[{label:"Possible response period",date:null,period,trigger:null,explicit:false,confidence:"low",sourceQuote:period?text.slice(Math.max(0,text.indexOf(period)-80),text.indexOf(period)+period.length+80):""}],facts:[],unknowns:["Agency identity","Required response","Exact deadline","Applicable procedural requirements"],warnings:[{title:"AI analysis unavailable",detail:"No authoritative interpretation was generated. Do not treat the extracted pattern as a confirmed deadline.",severity:"high"}],strategy:{responseType:"general_correspondence",objective:"Do not submit until the notice has been reviewed.",steps:["Review the complete notice","Confirm the agency and response deadline","Gather supporting evidence"],evidenceNeeded:[],risks:["Submitting an incomplete or incorrect response"]},responseDraft:"No response draft was generated because the source has not been reliably analyzed.",review:[{label:"Source-backed analysis",status:"fail",detail:"AI analysis unavailable."}]};
}

export default { async fetch(request:Request, env:Env){
  const url=new URL(request.url);
  if(url.pathname==='/api/health') return Response.json({ok:true,service:'govreply'});
  if(url.pathname==='/api/analyze' && request.method==='POST'){
    try{
      const body=await request.json() as {text?:string};
      const text=(body.text||'').trim();
      if(!text) return Response.json({error:'Document text is required.'},{status:400});
      if(text.length>120000) return Response.json({error:'Document exceeds the analysis limit.'},{status:413});
      const prompt=`${SYSTEM}\n\n${SCHEMA}\n\nDOCUMENT TEXT:\n${text}`;
      if(!env.AI) return Response.json(fallback(text));
      const result=await env.AI.run('@cf/openai/gpt-oss-20b',{messages:[{role:'system',content:SYSTEM},{role:'user',content:`${SCHEMA}\n\nDOCUMENT TEXT:\n${text}`}],max_tokens:6000,temperature:0.1});
      const raw=typeof result==='string'?result:JSON.stringify(result);
      const candidate=raw.match(/\{[\s\S]*\}/)?.[0];
      if(!candidate) throw new Error('Model did not return JSON');
      return Response.json(JSON.parse(candidate));
    }catch(error){ console.error(error); return Response.json({error:'Analysis failed safely. No response was generated.'},{status:502}); }
  }
  return env.ASSETS.fetch(request);
} };
