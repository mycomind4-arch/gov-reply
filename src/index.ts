import { sources, dossiers } from "./catalog";
import { validateFacts } from "./validation";
type Env = { ASSETS: Fetcher };
const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" };
function json(body: unknown, status = 200): Response { return new Response(JSON.stringify(body), { status, headers }); }
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    if (request.method === "GET" && url.pathname === "/api/health") return json({ status: "ok", mode: "prototype", live_filing: false });
    if (request.method === "GET" && url.pathname === "/api/sources") return json({ verified_current: false, sources });
    if (request.method === "GET" && url.pathname === "/api/dossiers") return json({ dossiers });
    if (request.method === "POST" && url.pathname === "/api/validate") {
      if (Number(request.headers.get("content-length") || 0) > 32768) return json({ error: "payload_too_large" }, 413);
      let payload: unknown;
      try { const body = await request.text(); if (body.length > 32768) return json({ error: "payload_too_large" }, 413); payload = JSON.parse(body); }
      catch { return json({ error: "invalid_json" }, 400); }
      if (!payload || typeof payload !== "object" || Array.isArray(payload) || !("facts" in payload)) return json({ error: "facts_required" }, 400);
      const facts = (payload as { facts: unknown }).facts;
      if (!facts || typeof facts !== "object" || Array.isArray(facts) || Object.keys(facts).length > 100) return json({ error: "invalid_facts" }, 400);
      return json({ scope: "clerical_only", legal_review_required: true, issues: validateFacts(facts as Record<string, unknown>) });
    }
    return json({ error: "not_found" }, 404);
  }
};
