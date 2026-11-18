import {describe,it,expect} from "vitest";
import {PDFDocument} from "pdf-lib";
import {inspectForm,fillForm} from "../client/form-core.js";
async function fixture(){
 const doc=await PDFDocument.create(),page=doc.addPage([612,792]),form=doc.getForm();
 const name=form.createTextField("applicant.name");name.addToPage(page,{x:40,y:650,width:250,height:22});name.setText("Original Name");
 const consent=form.createCheckBox("consent");consent.addToPage(page,{x:40,y:600,width:20,height:20});consent.check();
 const dropdown=form.createDropdown("status");dropdown.addOptions(["Pending","Approved"]);dropdown.select("Pending");dropdown.addToPage(page,{x:40,y:550,width:180,height:22});
 return doc.save();
}
describe("fillable PDF engine",()=>{
 it("detects interactive fields and existing values",async()=>{const result=await inspectForm(new Uint8Array(await fixture()));expect(result.pages).toBe(1);expect(result.fields.map(f=>f.name)).toEqual(["applicant.name","consent","status"]);expect(result.fields[0].value).toBe("Original Name");expect(result.fields[1].value).toBe(true);expect(result.fields[2].options).toEqual(["Pending","Approved"]);});
 it("updates only selected fields while preserving others",async()=>{const bytes=await fillForm(new Uint8Array(await fixture()),{"0":"Jane Doe"});const form=(await PDFDocument.load(bytes)).getForm();expect(form.getTextField("applicant.name").getText()).toBe("Jane Doe");expect(form.getCheckBox("consent").isChecked()).toBe(true);expect(form.getDropdown("status").getSelected()).toEqual(["Pending"]);});
 it("fills checkboxes and dropdowns",async()=>{const bytes=await fillForm(new Uint8Array(await fixture()),{"1":false,"2":"Approved"});const form=(await PDFDocument.load(bytes)).getForm();expect(form.getCheckBox("consent").isChecked()).toBe(false);expect(form.getDropdown("status").getSelected()).toEqual(["Approved"]);});
 it("rejects unknown field indices and invalid choices",async()=>{const bytes=new Uint8Array(await fixture());await expect(fillForm(bytes,{"999":"bad"})).rejects.toThrow("Unknown field");await expect(fillForm(bytes,{"2":"Invalid"})).rejects.toThrow("Invalid option");});
 it("rejects non-PDF input",async()=>{await expect(inspectForm(new TextEncoder().encode("not a pdf"))).rejects.toThrow();});
});
