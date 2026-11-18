import {inspectForm,fillForm} from "./form-core.js";
let source=null,metadata=null,loadToken=0;
const get=id=>document.getElementById(id),status=get("form-status");
get("form-file")?.addEventListener("change",async event=>{
 const token=++loadToken;source=null;metadata=null;get("form-fill").hidden=true;get("form-fields").replaceChildren();get("form-info").textContent="No document loaded.";
 const file=event.target.files?.[0];if(!file)return;
 if(file.size>15*1024*1024){status.textContent="PDF exceeds 15 MB.";return;}
 try{
  const bytes=new Uint8Array(await file.arrayBuffer());const info=await inspectForm(bytes);
  if(token!==loadToken)return;source=bytes;metadata=info;
  get("form-info").textContent=info.pages+" pages; "+info.fields.length+" interactive fields. Form edition has not been verified.";
  if(!info.fields.length){status.textContent="This PDF has no interactive fields.";return;}
  for(const field of info.fields){
   const wrap=document.createElement("label");wrap.className="formfield";wrap.textContent=field.name+" ("+field.type+")";
   let input;
   if(field.type==="PDFTextField"){input=document.createElement("input");input.maxLength=2000;input.value=field.value??"";}
   else if(field.type==="PDFCheckBox"){input=document.createElement("input");input.type="checkbox";input.checked=!!field.value;}
   else if((field.type==="PDFDropdown"||field.type==="PDFRadioGroup")&&field.options?.length){input=document.createElement("select");for(const value of field.options){const option=document.createElement("option");option.value=value;option.textContent=value;input.append(option);}input.value=field.value&&field.options.includes(field.value)?field.value:field.options[0];}
   else{const msg=document.createElement("span");msg.className="muted";msg.textContent="Unsupported field; preserved unchanged.";wrap.append(msg);get("form-fields").append(wrap);continue;}
   input.dataset.fieldIndex=String(field.id);input.disabled=field.readOnly;
   wrap.append(input);get("form-fields").append(wrap);
  }
  get("form-fill").hidden=false;status.textContent="Existing field values loaded. Review every entry before downloading.";
 }catch(error){if(token!==loadToken)return;source=null;metadata=null;status.textContent="Unable to read PDF: "+error.message;}
});
get("form-fill")?.addEventListener("submit",async event=>{
 event.preventDefault();if(!source||!metadata)return;
 const values={};
 for(const input of get("form-fields").querySelectorAll("[data-field-index]")){
  if(input.disabled)continue;
  const field=metadata.fields[Number(input.dataset.fieldIndex)];
  const value=input.type==="checkbox"?input.checked:input.value;
  if(value!==field.value)values[input.dataset.fieldIndex]=value;
 }
 try{
  const bytes=await fillForm(source,values);const url=URL.createObjectURL(new Blob([bytes],{type:"application/pdf"}));
  const a=document.createElement("a");a.href=url;a.download="completed-form.pdf";document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent="PDF download requested. Check all fields and official instructions.";
 }catch(error){status.textContent="Unable to fill PDF: "+error.message;}
});
