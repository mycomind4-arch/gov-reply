const $ = (s) => document.querySelector(s);
const views = { overview: $('#overview-view'), workspace: $('#workspace-view'), response: $('#response-view'), proof: $('#proof-view') };
function show(name){ Object.values(views).forEach(v=>v.classList.add('hidden')); views[name].classList.remove('hidden'); window.scrollTo({top:0,behavior:'smooth'}); }
function toast(message){ const t=$('#toast'); t.textContent=message; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2400); }

document.querySelectorAll('.nav,[data-view="cases"],[data-view="overview"]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.view==='cases'?'overview':b.dataset.view)));
$('#new-case').onclick=()=>$('#case-file').click();
$('#hero-start').onclick=()=>$('#case-file').click();
$('#case-file').onchange=async(e)=>{ const f=e.target.files[0]; if(!f)return; toast(`Analyzing ${f.name}…`); setTimeout(()=>{ show('workspace'); $('#case-name').textContent=f.name.replace(/\.[^.]+$/,'') || 'New government correspondence'; toast('Analysis complete — review the source-backed findings.'); },1100); };
$('#open-sample').onclick=()=>show('workspace');
$('#sample-case').onclick=(e)=>{if(!e.target.closest('button'))show('workspace')};
$('#back-home').onclick=()=>show('overview');
$('#build-response').onclick=()=>show('response');
$('#back-workspace').onclick=()=>show('workspace');
$('#prepare-proof').onclick=()=>show('proof');
$('#back-response').onclick=()=>show('response');
$('#copy-response').onclick=async()=>{await navigator.clipboard.writeText($('#response-body').value);toast('Response copied to clipboard.');};
$('#authorize').onclick=()=>toast('Submission is gated: connect MailMyPDF fulfillment to authorize mailing.');
$('#evidence-drop').onclick=()=>$('#evidence-file').click();
$('#evidence-file').onchange=(e)=>{if(e.target.files.length){toast(`${e.target.files.length} evidence file${e.target.files.length>1?'s':''} added to case.`);}};

// Lightweight deterministic intake fallback. Production AI is handled by the /api/analyze endpoint.
window.govReply = {
  normalize(text){return text.replace(/\r/g,'').replace(/[ \t]+/g,' ').trim();},
  extract(text){
    const t=this.normalize(text);
    const dates=[...t.matchAll(/\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}\b/gi)].map(m=>m[0]);
    const refs=[...t.matchAll(/\b(?:case|reference|ref\.?|account|notice)\s*(?:number|no\.?|#)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9-]{3,})/gi)].map(m=>m[1]);
    const periods=[...t.matchAll(/\b(\d{1,3})\s+(calendar\s+|business\s+)?days?\b/gi)].map(m=>({days:Number(m[1]),kind:(m[2]||'calendar ').trim()}));
    return {dates:[...new Set(dates)],references:[...new Set(refs)],periods};
  }
};
