import { PDFDocument } from "pdf-lib";
const MAX_BYTES=15*1024*1024;
export async function inspectForm(bytes){
 if(!(bytes instanceof Uint8Array)||bytes.length<8||bytes.length>MAX_BYTES)throw Error("PDF must be between 8 bytes and 15 MB.");
 if(new TextDecoder("ascii").decode(bytes.subarray(0,5))!=="%PDF-")throw Error("File is not a PDF.");
 const doc=await PDFDocument.load(bytes,{ignoreEncryption:false});
 const fields=doc.getForm().getFields().map((field,index)=>({id:index,name:field.getName(),type:field.constructor.name,readOnly:field.isReadOnly?.()??false}));
 return {pages:doc.getPageCount(),fields};
}
export async function fillForm(bytes,values){
 const doc=await PDFDocument.load(bytes,{ignoreEncryption:false});
 const form=doc.getForm();const fields=form.getFields();
 for(const [key,value] of Object.entries(values)){
  const index=Number(key);if(!Number.isSafeInteger(index)||index<0||index>=fields.length)throw Error("Unknown field");
  const field=fields[index];if(field.isReadOnly?.())throw Error("Field is read-only");
  const kind=field.constructor.name;
  if(kind==="PDFTextField"){if(String(value).length>2000)throw Error("Text too long");field.setText(String(value));}
  else if(kind==="PDFCheckBox"){value===true?field.check():field.uncheck();}
  else if(kind==="PDFDropdown"){field.select(String(value));}
  else if(kind==="PDFRadioGroup"){field.select(String(value));}
  else throw Error("Unsupported field type: "+kind);
 }
 return doc.save();
}
