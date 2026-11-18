import {createDocumentPDF} from "./pdf-core.js";
let previewURL=null;
const get=id=>document.getElementById(id);
const fields=()=>({kind:get("pdf-kind").value,sender:get("pdf-sender").value.trim(),address:get("pdf-address").value.trim(),recipient:get("pdf-recipient").value.trim(),subject:get("pdf-subject").value.trim(),body:get("pdf-body").value.trim()});
function safeName(name){return (name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,45)||"document")+".pdf";}
async function generate(download){const status=get("pdf-status");const data=fields();if(!data.sender||!data.subject||!data.body){status.textContent="Enter a sender, subject, and body first.";return;}status.textContent="Generating PDF…";try{const bytes=await createDocumentPDF(data);const blob=new Blob([bytes],{type:"application/pdf"});if(previewURL)URL.revokeObjectURL(previewURL);previewURL=URL.createObjectURL(blob);const frame=get("pdf-preview-frame");frame.src=previewURL;frame.hidden=false;get("pdf-preview-placeholder").hidden=true;if(download){const link=document.createElement("a");link.href=previewURL;link.download=safeName(data.subject);document.body.append(link);link.click();link.remove();}status.textContent=download?"PDF generated and download requested.":"PDF generated. Review the preview before downloading.";}catch(error){console.error("PDF generation failed",error);status.textContent="PDF generation failed. Check the text and try again.";}}
get("pdf-editor")?.addEventListener("submit",event=>{event.preventDefault();generate(true);});
get("pdf-preview-button")?.addEventListener("click",()=>generate(false));
window.addEventListener("pagehide",()=>{if(previewURL)URL.revokeObjectURL(previewURL);});
