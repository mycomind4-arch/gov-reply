import {layout,escapeHTML} from "./components.js";
import {home,expert,forms,cases,professionals,sources,dossierCard,documents} from "./pages.js";
const views={"/":home,"/expert":expert,"/forms":forms,"/cases":cases,"/professionals":professionals,"/sources":sources,"/documents":documents};
const path=location.pathname.replace(/\/$/,"")||"/";
document.getElementById("app").innerHTML=layout(path,(views[path]||(()=>'<main class="shell content"><h1>Page not found</h1><a href="/">Return home</a></main>'))());
const questionForm=document.getElementById("question-form");
questionForm?.addEventListener("submit",e=>{e.preventDefault();const q=document.getElementById("question").value.trim();if(q){sessionStorage.setItem("govreply_question",q);location.href="/expert";}});
const researchQuestion=document.getElementById("research-question");
if(researchQuestion){researchQuestion.value=sessionStorage.getItem("govreply_question")||"";sessionStorage.removeItem("govreply_question");}
document.getElementById("research-form")?.addEventListener("submit",e=>{e.preventDefault();const out=document.getElementById("research-result");out.textContent="Research assistant is not yet connected. Browse the official sources below for current agency instructions.";const a=document.createElement("a");a.href="/sources";a.textContent="Open official source directory";a.style.display="block";out.append(a);});
document.querySelectorAll("[data-audience]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-audience]").forEach(x=>x.classList.toggle("selected",x===b));const professional=b.dataset.audience==="professional";document.getElementById("features").innerHTML=(professional?["Credential verification (planned)","Case review workspace (planned)","Source-backed research (planned)","Audit and approvals (planned)"]:["Official information directory","Form preparation roadmap","Document checklists","Notice analysis roadmap"]).map(x=>"<li>"+escapeHTML(x)+"</li>").join("");}));
async function loadCatalog(){if(path==="/forms"){const target=document.getElementById("dossier-cards");try{const response=await fetch("/api/dossiers");if(!response.ok)throw Error();const data=await response.json();target.innerHTML=data.dossiers.map(dossierCard).join("");}catch{target.textContent="Dossier catalog unavailable.";}}if(path==="/sources"){const target=document.getElementById("source-list");try{const response=await fetch("/api/sources");if(!response.ok)throw Error();const data=await response.json();target.replaceChildren();for(const s of data.sources){const a=document.createElement("a");a.href=s.url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=s.title+" — "+s.agency;target.append(a);}}catch{target.textContent="Source directory unavailable.";}}}
loadCatalog();

if(path==="/documents"){import("./pdf-editor.bundle.js").catch(()=>{const status=document.getElementById("pdf-status");if(status)status.textContent="PDF engine unavailable. Try again later.";});}
