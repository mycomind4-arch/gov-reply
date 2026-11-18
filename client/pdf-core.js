import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const PAGE_WIDTH=612, PAGE_HEIGHT=792, MARGIN=58, BOTTOM=60, FONT_SIZE=11, LINE_HEIGHT=17;
export function sanitizeText(value){return String(value??"").replace(/\r\n?/g,"\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,"").slice(0,25000);}
function latin1Safe(s){return [...s].map(c=>c.codePointAt(0)<=255?c:"?").join("");}
function breakLine(line,font,maxWidth,size){const chunks=[];let current="";for(const word of line.split(/(\s+)/)){if(!word)continue;const next=current+word;if(font.widthOfTextAtSize(next,size)<=maxWidth){current=next;continue;}if(current.trim())chunks.push(current.trimEnd());current="";for(const char of word){if(font.widthOfTextAtSize(current+char,size)>maxWidth&&current){chunks.push(current);current="";}current+=char;}}chunks.push(current.trimEnd());return chunks;}
export function layoutLines(text,font,maxWidth,size=FONT_SIZE){return sanitizeText(text).split("\n").flatMap(line=>line?breakLine(latin1Safe(line),font,maxWidth,size):[""]);}
export async function createDocumentPDF(fields){
 const doc=await PDFDocument.create();doc.setTitle(sanitizeText(fields.subject||"Immigration document"));doc.setCreator("GovReply PDF editor");
 const font=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 let page=doc.addPage([PAGE_WIDTH,PAGE_HEIGHT]);let y=PAGE_HEIGHT-MARGIN;
 const addPage=()=>{page=doc.addPage([PAGE_WIDTH,PAGE_HEIGHT]);y=PAGE_HEIGHT-MARGIN;};
 const write=(text,opts={})=>{const chosen=opts.bold?bold:font;const size=opts.size||FONT_SIZE;for(const line of layoutLines(text,chosen,PAGE_WIDTH-2*MARGIN,size)){if(y<BOTTOM+LINE_HEIGHT)addPage();if(line)page.drawText(line,{x:MARGIN,y,size,font:chosen,color:rgb(.10,.16,.30)});y-=LINE_HEIGHT;}};
 const space=(amount=12)=>{y-=amount;if(y<BOTTOM+LINE_HEIGHT)addPage();};
 write(fields.sender);if(fields.address)write(fields.address);space(16);
 write(new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}));space(14);
 if(fields.recipient){write(fields.recipient);space(15);}
 write(fields.subject,{bold:true});space(18);
 write(fields.body);space(28);write("Sincerely,");space(22);write(fields.sender);
 const pages=doc.getPages();for(let i=0;i<pages.length;i++){pages[i].drawText(`Page ${i+1} of ${pages.length}`,{x:PAGE_WIDTH-MARGIN-83,y:32,size:9,font,color:rgb(.43,.48,.58)});}
 return doc.save();
}
