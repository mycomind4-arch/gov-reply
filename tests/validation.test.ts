import { describe, it, expect } from "vitest";
import { validateFacts } from "../src/validation";
import { sources, dossiers } from "../src/catalog";
describe("safe foundation", () => {
 it("flags malformed birth date", () => expect(validateFacts({ birth_date: "12/31/2000" })[0]?.code).toBe("date_format"));
 it("accepts ISO formatted date", () => expect(validateFacts({ birth_date: "2000-12-31" })).toEqual([]));
 it("does not claim dossier certification", () => expect(dossiers.every(d => d.status === "unverified" && !d.enabled)).toBe(true));
 it("uses HTTPS official source links", () => expect(sources.every(s => s.url.startsWith("https://"))).toBe(true));
});
