import {describe,it,expect} from "vitest";
import {PDFDocument} from "pdf-lib";
import {inspectForm,fillForm} from "../client/form-core.js";
async function fixture(){const doc=await PDFDocument.create();const page=doc.addPage([612,792]);const form=doc.getForm();form.createTextField("applicant.name").addToPage(page,{x:40,y:650,width:250,height:22});form.createCheckBox("consent").addToPage(page,{x:40,y:600,width:20,height:20});return doc.save();}
describe("fillable PDF engine",()=>{
 it("detects interactive fields",async()=>{const result=await inspectForm(new Uint8Array(await fixture()));expect(result.pages).toBe(1);expect(result.fields.map(f=>f.name)).toEqual(["applicant.name","consent"]);});
 it("fills text and checkboxes",async()=>{const bytes=await fillForm(new Uint8Array(await fixture()),{"0":"Jane Doe","1":true});const doc=await PDFDocument.load(bytes);expect(doc.getForm().getTextField("applicant.name").getText()).toBe("Jane Doe");expect(doc.getForm().getCheckBox("consent").isChecked()).toBe(true);});
 it("rejects unknown field indices",async()=>{await expect(fillForm(new Uint8Array(await fixture()),{"999":"bad"})).rejects.toThrow("Unknown field");});
 it("rejects non-PDF input",async()=>{await expect(inspectForm(new TextEncoder().encode("not a pdf"))).rejects.toThrow();});
});
