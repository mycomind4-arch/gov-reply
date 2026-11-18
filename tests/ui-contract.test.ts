import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
const read = (path: string) => readFileSync(join(process.cwd(),path),"utf8");
describe("shared UI contracts", () => {
 it("serves a single reusable application shell", () => {
   const html=read("public/index.html");
   expect(html).toContain('id="app"');
   expect(html).toContain('/app.js');
   expect(html).toContain('/styles.css');
 });
 it("uses reusable components for every page", () => {
   const pages=read("public/pages.js");
   expect(pages).toContain('from "./components.js"');
   for(const route of ["home","expert","forms","cases","professionals","sources"]) expect(pages).toContain("function "+route+"(");
 });
 it("supports direct navigation to SPA pages", () => {
   expect(read("wrangler.toml")).toContain('not_found_handling = "single-page-application"');
 });
 it("never claims live filing is enabled", () => {
   expect(read("public/pages.js")).toContain("not yet available");
   expect(read("public/components.js")).toContain("No live filing");
 });
});
