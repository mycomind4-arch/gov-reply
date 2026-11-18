import { PDFDocument } from "pdf-lib";
const MAX_BYTES=15*1024*1024;
function ensurePDF(bytes){
 if(!(bytes instanceof Uint8Array)||bytes.length<8||bytes.length>MAX_BYTES)throw Error("PDF must be between 8 bytes and 15 MB.");
 if(new TextDecoder("ascii").decode(bytes.subarray(0,5))!=="%PDF-")throw Error("File is not a PDF.");
}
function describeField(field,index){
 const type=field.constructor.name;
 const result={id:index,name:field.getName(),type,readOnly:field.isReadOnly?.()??false};
 if(type==="PDFTextField")result.value=field.getText()??"";
 if(type==="PDFCheckBox")result.value=field.isChecked();
 if(type==="PDFDropdown"||type==="PDFRadioGroup"){
  result.options=field.getOptions();
  result.value=type==="PDFDropdown"?(field.getSelected()?.[0]??""):(field.getSelected()??"");
 }
 return result;
}
export async function inspectForm(bytes){
 ensurePDF(bytes);
 const doc=await PDFDocument.load(bytes,{ignoreEncryption:false});
 return {pages:doc.getPageCount(),fields:doc.getForm().getFields().map(describeField)};
}
export async function fillForm(bytes,values){
 ensurePDF(bytes);
 const doc=await PDFDocument.load(bytes,{ignoreEncryption:false});
 const fields=doc.getForm().getFields();
 for(const [key,value] of Object.entries(values)){
  const index=Number(key);if(!/^\d+$/.test(key)||!Number.isSafeInteger(index)||index>=fields.length)throw Error("Unknown field");
  const field=fields[index];if(field.isReadOnly?.())throw Error("Field is read-only");
  const kind=field.constructor.name;
  if(kind==="PDFTextField"){if(typeof value!=="string"||value.length>2000)throw Error("Invalid text");field.setText(value);}
  else if(kind==="PDFCheckBox"){if(typeof value!=="boolean")throw Error("Invalid checkbox");value?field.check():field.uncheck();}
  else if(kind==="PDFDropdown"||kind==="PDFRadioGroup"){
   if(typeof value!=="string"||!field.getOptions().includes(value))throw Error("Invalid option");
   field.select(value);
  }else throw Error("Unsupported field type: "+kind);
 }
 return doc.save();
}
