import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const PAGE_WIDTH=612, PAGE_HEIGHT=792, MARGIN=58, BOTTOM=60, FONT_SIZE=11, LINE_HEIGHT=17;
export function sanitizeText(value){return String(value??"").replace(/\r\n?/g,"\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,"").slice(0,25000);}
function safeFontText(value){return [...sanitizeText(value)].map(char=>{const code=char.codePointAt(0);return code>=32&&code<=126||code>=160&&code<=255?char:char==="\n"?"\n":"?";}).join("");}
function breakLine(line,font,maxWidth,size){const output=[];let current="";for(const char of line){if(font.widthOfTextAtSize(current+char,size)>maxWidth&&current){output.push(current);current="";}current+=char;}output.push(current);return output;}
export function layoutLines(text,font,maxWidth,size=FONT_SIZE){return safeFontText(text).split("\n").flatMap(line=>breakLine(line,font,maxWidth,size));}
export async function createDocumentPDF(fields,options={}){
 if(!fields||!String(fields.sender??"").trim()||!String(fields.subject??"").trim()||!String(fields.body??"").trim())throw new Error("Sender, subject, and body are required");
 const doc=await PDFDocument.create();
 doc.setTitle(safeFontText(fields.subject||"Immigration document"));doc.setCreator("GovReply PDF editor");
 const font=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 let page=doc.addPage([PAGE_WIDTH,PAGE_HEIGHT]),y=PAGE_HEIGHT-MARGIN;
 const addPage=()=>{page=doc.addPage([PAGE_WIDTH,PAGE_HEIGHT]);y=PAGE_HEIGHT-MARGIN;};
 const write=(value,{isBold=false,size=FONT_SIZE}={})=>{const f=isBold?bold:font;for(const line of layoutLines(value,f,PAGE_WIDTH-2*MARGIN,size)){if(y<BOTTOM+LINE_HEIGHT)addPage();if(line)page.drawText(line,{x:MARGIN,y,size,font:f,color:rgb(.10,.16,.30)});y-=LINE_HEIGHT;}};
 const space=(amount=12)=>{if(y-amount<BOTTOM+LINE_HEIGHT)addPage();else y-=amount;};
 write(fields.sender);if(fields.address)write(fields.address);space(16);
 const date=options.date instanceof Date?options.date:new Date();
 write(date.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",timeZone:"UTC"}));space(14);
 if(fields.recipient){write(fields.recipient);space(15);}
 write(fields.subject,{isBold:true});space(18);write(fields.body);space(28);write("Sincerely,");space(22);write(fields.sender);
 const pages=doc.getPages();for(let i=0;i<pages.length;i++){pages[i].drawText(`Page ${i+1} of ${pages.length}`,{x:PAGE_WIDTH-MARGIN-83,y:32,size:9,font,color:rgb(.43,.48,.58)});}
 return doc.save();
}
