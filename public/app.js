const $ = (s) => document.querySelector(s);
const views = { overview: $('#overview-view'), workspace: $('#workspace-view'), response: $('#response-view'), proof: $('#proof-view') };
function show(name){ Object.values(views).forEach(v=>v.classList.add('hidden')); views[name].classList.remove('hidden'); window.scrollTo({top:0,behavior:'smooth'}); }
function toast(message){ const t=$('#toast'); t.textContent=message; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2400); }
function escapeText(v){return String(v??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
function renderAnalysis(a,name){
  $('#case-name').textContent=a.document?.noticeType || name.replace(/\.[^.]+$/,'') || 'Government correspondence';
  $('#case-agency').textContent=[a.document?.agency,a.document?.department].filter(Boolean).join(' · ')||'Government agency · Source analysis';
  const d=a.deadlines?.find(x=>x.date)||a.document?.issueDate; if(d) $('#deadline-date').textContent=d;
  if(a.plainEnglishSummary) $('#summary').textContent=a.plainEnglishSummary;
  const actions=a.whatTheyWant||[];
  if(actions.length) document.querySelector('.action-list').innerHTML=actions.slice(0,4).map((x,i)=>`<div><b>${String(i+1).padStart(2,'0')}</b><span>${escapeText(x.action)}${x.sourceQuote?` <small style="display:block;color:#87909f;margin-top:3px">Source: “${escapeText(x.sourceQuote.slice(0,150))}”</small>`:''}</span></div>`).join('');
  const facts=a.facts||[];
  if(facts.length) document.querySelector('.fact-table').innerHTML=facts.slice(0,6).map(x=>`<div><span>${escapeText(x.label)}</span><b>${escapeText(x.value)}</b><em>${x.sourceQuote?'Source-backed':'Review'}</em></div>`).join('');
  const draft=a.responseDraft?.trim(); if(draft) $('#response-body').value=draft;
  const review=a.review||[]; const score=review.length?Math.round(review.reduce((n,x)=>n+(x.status==='pass'?100:x.status==='warning'?70:0),0)/review.length):72; const strong=$('.review-score strong'); if(strong) strong.textContent=score;
}
async function analyzeFile(file){
  toast(`Reading ${file.name}…`);
  if(file.type==='application/pdf' || /\.pdf$/i.test(file.name)){ show('workspace'); $('#case-name').textContent=file.name.replace(/\.pdf$/i,''); toast('PDF received. Connect the platform document extractor for page-level text analysis.'); return; }
  const text=await file.text(); if(!text.trim()){toast('The file contained no readable text.');return;}
  toast('Running source-grounded analysis…');
  try{ const r=await fetch('/api/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text})}); const data=await r.json(); if(!r.ok) throw new Error(data.error||'Analysis failed'); renderAnalysis(data,file.name); show('workspace'); toast('Analysis complete — review source-backed findings.'); }
  catch(e){show('workspace'); $('#case-name').textContent=file.name.replace(/\.[^.]+$/,''); toast('Analysis could not be completed safely.');}
}
document.querySelectorAll('.nav,[data-view="cases"],[data-view="overview"]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.view==='cases'?'overview':b.dataset.view)));
$('#new-case').onclick=()=>$('#case-file').click(); $('#hero-start').onclick=()=>$('#case-file').click();
$('#case-file').onchange=async(e)=>{ const f=e.target.files[0]; if(f) await analyzeFile(f); e.target.value=''; };
$('#open-sample').onclick=()=>show('workspace'); $('#sample-case').onclick=(e)=>{if(!e.target.closest('button'))show('workspace')};
$('#back-home').onclick=()=>show('overview'); $('#build-response').onclick=()=>show('response'); $('#back-workspace').onclick=()=>show('workspace'); $('#prepare-proof').onclick=()=>show('proof'); $('#back-response').onclick=()=>show('response');
$('#copy-response').onclick=async()=>{await navigator.clipboard.writeText($('#response-body').value);toast('Response copied to clipboard.');};
$('#authorize').onclick=()=>toast('Submission is gated: connect MailMyPDF fulfillment to authorize mailing.');
$('#evidence-drop').onclick=()=>$('#evidence-file').click(); $('#evidence-file').onchange=(e)=>{if(e.target.files.length)toast(`${e.target.files.length} evidence file${e.target.files.length>1?'s':''} added to case.`);};
window.govReply={analyzeFile};
