interface AI { run(model: string, input: unknown): Promise<unknown>; }
interface Env { AI: AI; ASSETS: { fetch(request: Request): Promise<Response> }; }

const SYSTEM = `You are GovReply, an expert government-correspondence analyst and professional response writer. Analyze ONLY the supplied document and user-provided facts. Never invent facts, dates, deadlines, statutes, agency requirements, procedural rights, payments, attachments, or events. Distinguish explicit source facts from interpretation. Every important extracted item must include a short exact source quote. If something cannot be established, say unknown. Do not give legal advice. Do not claim compliance unless the record establishes it. Write responses that are specific, professional, calm, concise, factual, and appropriate for correspondence with a government agency. Never manufacture legal citations. Before drafting, identify what the agency wants, what is known, what is missing, and what the response should accomplish.`;

const SCHEMA = `Return ONLY valid JSON with this shape:
{"document":{"agency":string|null,"department":string|null,"noticeType":string|null,"referenceNumber":string|null,"issueDate":string|null,"receivedDate":string|null},"plainEnglishSummary":string,"whatTheyWant":[{"action":string,"required":boolean,"sourceQuote":string}],"deadlines":[{"label":string,"date":string|null,"period":string|null,"trigger":string|null,"explicit":boolean,"confidence":"high"|"medium"|"low"|"unknown","sourceQuote":string}],"facts":[{"label":string,"value":string,"confidence":"high"|"medium"|"low"|"unknown","sourceQuote":string}],"unknowns":[string],"warnings":[{"title":string,"detail":string,"severity":"high"|"medium"|"low"}],"strategy":{"responseType":string,"objective":string,"steps":[string],"evidenceNeeded":[string],"risks":[string]},"responseDraft":string,"review":[{"label":string,"status":"pass"|"warning"|"fail","detail":string}]}`;

function fallback(){return {document:{agency:null,department:null,noticeType:null,referenceNumber:null,issueDate:null,receivedDate:null},plainEnglishSummary:"Automatic analysis is unavailable. Review the source document directly before taking action.",whatTheyWant:[],deadlines:[],facts:[],unknowns:["Agency","Required action","Exact deadline","Applicable requirements"],warnings:[{title:"Analysis unavailable",detail:"No authoritative analysis was generated. Do not rely on inferred dates or requirements.",severity:"high"}],strategy:{responseType:"general_correspondence",objective:"Review the notice before responding.",steps:["Read the complete notice","Confirm the agency and deadline","Gather requested information"],evidenceNeeded:[],risks:["Submitting an incomplete or incorrect response"]},responseDraft:"No response was generated because the document could not be reliably analyzed.",review:[{label:"Source-grounded analysis",status:"fail",detail:"AI analysis unavailable."}]};}

function normalize(result:unknown){
  const raw=typeof result==='string'?result:JSON.stringify(result);
  const candidate=raw.match(/\{[\s\S]*\}/)?.[0];
  if(!candidate) throw new Error('Model did not return JSON');
  const value=JSON.parse(candidate);
  if(!value.document||typeof value.plainEnglishSummary!=='string'||!Array.isArray(value.whatTheyWant)||!Array.isArray(value.deadlines)||!Array.isArray(value.facts)||!value.strategy||typeof value.responseDraft!=='string'||!Array.isArray(value.review)) throw new Error('Invalid analysis shape');
  return value;
}

export default { async fetch(request:Request, env:Env){
  const url=new URL(request.url);
  if(url.pathname==='/api/health') return Response.json({ok:true,service:'govreply'});
  if(url.pathname==='/api/analyze'&&request.method==='POST'){
    try{
      const body=await request.json() as {text?:string}; const text=(body.text||'').trim();
      if(!text) return Response.json({error:'Document text is required.'},{status:400});
      if(text.length>120000) return Response.json({error:'Document exceeds the analysis limit.'},{status:413});
      if(!env.AI) return Response.json(fallback());
      const result=await env.AI.run('@cf/openai/gpt-oss-20b',{messages:[{role:'system',content:SYSTEM},{role:'user',content:`${SCHEMA}\n\nDOCUMENT TEXT:\n${text}`}],max_tokens:6000,temperature:0.1});
      return Response.json(normalize(result));
    }catch(error){ console.error(error); return Response.json({error:'Analysis failed safely. No response was generated.'},{status:502}); }
  }
  return env.ASSETS.fetch(request);
} };
