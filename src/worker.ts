interface AI { run(model: string, input: unknown): Promise<unknown>; }
interface Env { AI: AI; ASSETS: { fetch(request: Request): Promise<Response> }; SUPABASE_URL?: string; SUPABASE_ANON_KEY?: string; SUPABASE_SERVICE_ROLE_KEY?: string; STRIPE_SECRET_KEY?: string; MAILMYPDF_API_URL?: string; MAILMYPDF_API_KEY?: string; APP_URL?: string; }

const SYSTEM = `You are GovReply, an expert government-correspondence analyst and professional response writer. Analyze ONLY the supplied document and user-provided facts. Never invent facts, dates, deadlines, statutes, agency requirements, procedural rights, payments, attachments, or events. Distinguish explicit source facts from interpretation. Every important extracted item must include a short exact source quote. If something cannot be established, say unknown. Do not give legal advice. Do not claim compliance unless the record establishes it. Write responses that are specific, professional, calm, concise, factual, and appropriate for correspondence with a government agency. Never manufacture legal citations. Before drafting, identify what the agency wants, what is known, what is missing, and what the response should accomplish.`;
const SCHEMA = `Return ONLY valid JSON with this shape:\n{"document":{"agency":string|null,"department":string|null,"noticeType":string|null,"referenceNumber":string|null,"issueDate":string|null,"receivedDate":string|null},"plainEnglishSummary":string,"whatTheyWant":[{"action":string,"required":boolean,"sourceQuote":string}],"deadlines":[{"label":string,"date":string|null,"period":string|null,"trigger":string|null,"explicit":boolean,"confidence":"high"|"medium"|"low"|"unknown","sourceQuote":string}],"facts":[{"label":string,"value":string,"confidence":"high"|"medium"|"low"|"unknown","sourceQuote":string}],"unknowns":[string],"warnings":[{"title":string,"detail":string,"severity":"high"|"medium"|"low"}],"strategy":{"responseType":string,"objective":string,"steps":[string],"evidenceNeeded":[string],"risks":[string]},"responseDraft":string,"review":[{"label":string,"status":"pass"|"warning"|"fail","detail":string}]}`;
const PRICES = { standard: 499, certified: 1494, registered: 3249 } as const;

function json(data: unknown, status = 200) { return Response.json(data, { status, headers: { "cache-control": "no-store" } }); }
function fallback(){return {document:{agency:null,department:null,noticeType:null,referenceNumber:null,issueDate:null,receivedDate:null},plainEnglishSummary:"Automatic analysis is unavailable. Review the source document directly before taking action.",whatTheyWant:[],deadlines:[],facts:[],unknowns:["Agency","Required action","Exact deadline","Applicable requirements"],warnings:[{title:"Analysis unavailable",detail:"No authoritative analysis was generated. Do not rely on inferred dates or requirements.",severity:"high"}],strategy:{responseType:"general_correspondence",objective:"Review the notice before responding.",steps:["Read the complete notice","Confirm the agency and deadline","Gather requested information"],evidenceNeeded:[],risks:["Submitting an incomplete or incorrect response"]},responseDraft:"No response was generated because the document could not be reliably analyzed.",review:[{label:"Source-grounded analysis",status:"fail",detail:"AI analysis unavailable."}]};}
function normalize(result:unknown){ const raw=typeof result==='string'?result:JSON.stringify(result); const candidate=raw.match(/\{[\s\S]*\}/)?.[0]; if(!candidate) throw new Error('Model did not return JSON'); const value=JSON.parse(candidate); if(!value.document||typeof value.plainEnglishSummary!=='string'||!Array.isArray(value.whatTheyWant)||!Array.isArray(value.deadlines)||!Array.isArray(value.facts)||!value.strategy||typeof value.responseDraft!=='string'||!Array.isArray(value.review)) throw new Error('Invalid analysis shape'); return value; }

async function requireUser(request: Request, env: Env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) throw new Error("Account authentication is not configured.");
  const auth = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) throw Object.assign(new Error("Authentication required."), { status: 401 });
  const response = await fetch(`${env.SUPABASE_URL.replace(/\/$/, "")}/auth/v1/user`, { headers: { apikey: env.SUPABASE_ANON_KEY, authorization: auth } });
  if (!response.ok) throw Object.assign(new Error("Invalid or expired MailMyPDF Account session."), { status: 401 });
  return await response.json() as { id: string; email?: string };
}

async function db(env: Env, path: string, init: RequestInit = {}) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase server configuration is incomplete.");
  return fetch(`${env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`, { ...init, headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "content-type": "application/json", ...(init.headers || {}) } });
}

async function stripeSession(secret: string, sessionId: string) {
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, { headers: { authorization: `Bearer ${secret}` } });
  const value = await response.json() as { id?: string; payment_status?: string; payment_intent?: string; metadata?: Record<string, string> };
  if (!response.ok || !value.id) throw Object.assign(new Error("Invalid Stripe Checkout Session."), { status: 400 });
  return value;
}

async function createStripeCheckout(secret: string, params: Record<string, string>) {
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { authorization: `Bearer ${secret}`, "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(params) });
  const value = await response.json() as { id?: string; url?: string; error?: { message?: string } };
  if (!response.ok || !value.id) throw new Error(value.error?.message || "Stripe Checkout creation failed.");
  return value;
}

export default { async fetch(request:Request, env:Env){
  const url=new URL(request.url);
  if(url.pathname==='/api/health') return json({ok:true,service:'govreply'});
  if(url.pathname==='/api/auth/status'&&request.method==='GET'){
    try { const user=await requireUser(request,env); return json({configured:true,authenticated:true,user}); }
    catch(error){ return json({configured:Boolean(env.SUPABASE_URL&&env.SUPABASE_ANON_KEY),authenticated:false,error:error instanceof Error?error.message:'Not authenticated'},401); }
  }
  if(url.pathname==='/api/analyze'&&request.method==='POST'){
    try{
      await requireUser(request,env);
      const body=await request.json() as {text?:string}; const text=(body.text||'').trim();
      if(!text) return json({error:'Document text is required.'},400);
      if(text.length>120000) return json({error:'Document exceeds the analysis limit.'},413);
      if(!env.AI) return json(fallback());
      const result=await env.AI.run('@cf/openai/gpt-oss-20b',{messages:[{role:'system',content:SYSTEM},{role:'user',content:`${SCHEMA}\n\nDOCUMENT TEXT:\n${text}`}],max_tokens:6000,temperature:0.1});
      return json(normalize(result));
    }catch(error){ console.error(error); return json({error:error instanceof Error?error.message:'Analysis failed safely. No response was generated.'},(error as {status?:number})?.status||502); }
  }
  if(url.pathname==='/api/checkout'&&request.method==='POST'){
    try{
      const user=await requireUser(request,env); if(!env.STRIPE_SECRET_KEY) return json({error:'Stripe is not configured.'},503);
      const input=await request.json() as {workflowId?:string;draftContent?:string;mailClass?:keyof typeof PRICES;recipient?:Record<string,unknown>};
      const method=input.mailClass;
      if(!input.workflowId||!input.draftContent||input.draftContent.trim().length<20) return json({error:'Workflow and completed response draft are required.'},400);
      if(!method||!(method in PRICES)) return json({error:'A valid mail class is required.'},400);
      if(!input.recipient?.name||!input.recipient.address1||!input.recipient.city||!input.recipient.state||!input.recipient.zip) return json({error:'A complete recipient address is required.'},400);
      const intentResponse=await db(env,'mailing_intents',{method:'POST',headers:{prefer:'return=representation'},body:JSON.stringify({user_id:user.id,workflow_id:input.workflowId,status:'pending',mailing_method:method,draft_content:input.draftContent,recipient:input.recipient,total_cents:PRICES[method]})});
      if(!intentResponse.ok) return json({error:'Unable to create mailing intent.'},502);
      const rows=await intentResponse.json() as Array<{id:string}>; const intentId=rows[0]?.id; if(!intentId) return json({error:'Unable to create mailing intent.'},502);
      const appUrl=env.APP_URL||url.origin;
      const session=await createStripeCheckout(env.STRIPE_SECRET_KEY,{'mode':'payment','line_items[0][quantity]':'1','line_items[0][price_data][currency]':'usd','line_items[0][price_data][unit_amount]':String(PRICES[method]),'line_items[0][price_data][product_data][name]':`${method} government correspondence`,`metadata[mailing_intent_id]`:intentId,'metadata[owner_user_id]':user.id,'metadata[workflow_id]':input.workflowId,success_url:`${appUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${appUrl}/?checkout=cancelled`});
      await db(env,`mailing_intents?id=eq.${encodeURIComponent(intentId)}`,{method:'PATCH',body:JSON.stringify({stripe_session_id:session.id})});
      return json({ok:true,checkoutUrl:session.url,sessionId:session.id});
    }catch(error){ return json({error:error instanceof Error?error.message:'Unable to start checkout.'},(error as {status?:number})?.status||502); }
  }
  if(url.pathname==='/api/mail/response'&&request.method==='POST'){
    try{
      const user=await requireUser(request,env); if(!env.STRIPE_SECRET_KEY||!env.MAILMYPDF_API_URL||!env.MAILMYPDF_API_KEY) return json({error:'Fulfillment is not configured.'},503);
      const {stripeSessionId}=await request.json() as {stripeSessionId?:string}; if(!stripeSessionId) return json({error:'Stripe Checkout Session ID is required.'},400);
      const session=await stripeSession(env.STRIPE_SECRET_KEY,stripeSessionId); if(session.payment_status!=='paid') return json({error:'Payment has not been completed.'},409);
      if(session.metadata?.owner_user_id!==user.id||!session.metadata?.mailing_intent_id) return json({error:'Payment session does not belong to this account.'},403);
      const intentResponse=await db(env,`mailing_intents?id=eq.${encodeURIComponent(session.metadata.mailing_intent_id)}&user_id=eq.${encodeURIComponent(user.id)}&select=*`); if(!intentResponse.ok) return json({error:'Unable to load mailing intent.'},502);
      const intents=await intentResponse.json() as Array<Record<string,unknown>>; const intent=intents[0]; if(!intent) return json({error:'Mailing intent not found.'},404);
      if(intent.provider_order_id) return json({success:true,providerOrderId:intent.provider_order_id,trackingNumber:intent.tracking_number||null,idempotent:true});
      await db(env,`mailing_intents?id=eq.${encodeURIComponent(session.metadata.mailing_intent_id)}`,{method:'PATCH',body:JSON.stringify({status:'paid',stripe_payment_intent_id:session.payment_intent||null})});
      return json({success:true,status:'paid',mailingIntentId:session.metadata.mailing_intent_id,readyForMailMyPDF:true,idempotent:false});
    }catch(error){ return json({error:error instanceof Error?error.message:'Unable to verify mailing.'},(error as {status?:number})?.status||502); }
  }
  return env.ASSETS.fetch(request);
} };
