// Minimal public readiness check. Does not expose configuration values or private records.
export async function onRequestGet({ env }) {
  const headers = { "cache-control": "no-store", "x-content-type-options": "nosniff" };
  if (!env.DB) return Response.json({ ok: false, database: "binding_missing" }, { status: 503, headers });
  try {
    const row = await env.DB.prepare("SELECT 1 AS ready").first();
    if (row?.ready !== 1) throw new Error("D1 query failed");
    return Response.json({ ok: true, database: "connected" }, { headers });
  } catch {
    return Response.json({ ok: false, database: "query_failed" }, { status: 503, headers });
  }
}
