import {describe,it,expect} from "vitest";
import {PDFDocument,StandardFonts} from "pdf-lib";
import {createDocumentPDF,layoutLines,PAGE_WIDTH,PAGE_HEIGHT,MARGIN} from "../client/pdf-core.js";
const data={sender:"Jane Doe",address:"100 Example Street\nExample, CA 90000",recipient:"USCIS",subject:"Re: Supporting documents",body:"Please find the enclosed documents."};
describe("browser PDF creator",()=>{
 it("produces a valid US Letter PDF with standard content",async()=>{const bytes=await createDocumentPDF(data,{date:new Date("2026-01-01T00:00:00Z")});expect(bytes[0]).toBe(37);const pdf=await PDFDocument.load(bytes);expect(pdf.getPageCount()).toBe(1);expect(pdf.getPage(0).getSize()).toEqual({width:PAGE_WIDTH,height:PAGE_HEIGHT});expect(pdf.getTitle()).toBe(data.subject);});
 it("paginates long statements without changing page size",async()=>{const bytes=await createDocumentPDF({...data,body:Array.from({length:350},(_,i)=>"Evidence statement line "+i).join("\n")});const pdf=await PDFDocument.load(bytes);expect(pdf.getPageCount()).toBeGreaterThan(3);for(const p of pdf.getPages())expect(p.getSize()).toEqual({width:PAGE_WIDTH,height:PAGE_HEIGHT});});
 it("wraps extremely long unbroken strings within margins",async()=>{const doc=await PDFDocument.create();const font=await doc.embedFont(StandardFonts.Helvetica);const lines=layoutLines("X".repeat(4000),font,PAGE_WIDTH-2*MARGIN);expect(lines.length).toBeGreaterThan(1);for(const line of lines)expect(font.widthOfTextAtSize(line,11)).toBeLessThanOrEqual(PAGE_WIDTH-2*MARGIN);});
 it("replaces unsupported glyphs instead of crashing",async()=>{const bytes=await createDocumentPDF({...data,subject:"Test 📄 😀",body:"Please review 📝"});expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);});
 it("rejects incomplete documents",async()=>{await expect(createDocumentPDF({...data,body:""})).rejects.toThrow("required");});
});
