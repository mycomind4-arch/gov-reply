import {inspectForm,fillForm} from "./form-core.js";
let source=null,metadata=null;
const get=id=>document.getElementById(id);
const status=get("form-status");
get("form-file")?.addEventListener("change",async event=>{
 source=null;metadata=null;get("form-fill").hidden=true;get("form-fields").replaceChildren();get("form-info").textContent="No document loaded.";
 const file=event.target.files?.[0];if(!file)return;
 if(file.size>15*1024*1024){status.textContent="PDF exceeds 15 MB.";return;}
 try{source=new Uint8Array(await file.arrayBuffer());metadata=await inspectForm(source);
 get("form-info").textContent=metadata.pages+" pages; "+metadata.fields.length+" interactive fields. Form edition has not been verified.";
 if(!metadata.fields.length){status.textContent="This PDF has no supported interactive fields.";return;}
 for(const field of metadata.fields){const wrap=document.createElement("label");wrap.className="formfield";wrap.textContent=field.name+" ("+field.type+")";let input;
 if(field.type==="PDFTextField"){input=document.createElement("input");input.maxLength=2000;}
 else if(field.type==="PDFCheckBox"){input=document.createElement("input");input.type="checkbox";}
 else {const msg=document.createElement("span");msg.className="muted";msg.textContent="Unsupported in this editor; leave unchanged.";wrap.append(msg);get("form-fields").append(wrap);continue;}
 input.dataset.fieldIndex=String(field.id);input.disabled=field.readOnly;wrap.append(input);get("form-fields").append(wrap);}
 get("form-fill").hidden=false;status.textContent="Fields detected. Review every entry before using the PDF.";
 }catch(error){source=null;metadata=null;status.textContent="Unable to read PDF: "+error.message;}
});
get("form-fill")?.addEventListener("submit",async event=>{
 event.preventDefault();if(!source||!metadata)return;const values={};
 for(const input of get("form-fields").querySelectorAll("[data-field-index]"))if(!input.disabled)values[input.dataset.fieldIndex]=input.type==="checkbox"?input.checked:input.value;
 try{const bytes=await fillForm(source,values);const url=URL.createObjectURL(new Blob([bytes],{type:"application/pdf"}));const a=document.createElement("a");a.href=url;a.download="completed-form.pdf";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent="Completed PDF download requested. Check all fields and official instructions.";}catch(error){status.textContent="Unable to fill PDF: "+error.message;}
});
