// Non-sensitive readiness check. No personal data, keys, counts or table contents exposed.
export async function onRequestGet({ env }) {
  const headers = { "cache-control": "no-store", "x-content-type-options": "nosniff" };
  if (!env.DB) return Response.json({ ok: false, database: "binding_missing", reportingSchema: "unknown", contactSchema: "unknown" }, { status: 503, headers });
  try {
    const row = await env.DB.prepare("SELECT 1 AS ready").first();
    if (row?.ready !== 1) throw new Error("D1 query failed");
  } catch {
    return Response.json({ ok: false, database: "query_failed", reportingSchema: "unknown", contactSchema: "unknown" }, { status: 503, headers });
  }
  let reportingSchema = "missing";
  let contactSchema = "missing";
  // Ensure the migrations were applied to production D1, without creating data.
  try {
    await env.DB.prepare("SELECT id, submission_id, reason, status FROM reports LIMIT 0").all();
    await env.DB.prepare("SELECT key, count, expires_at FROM report_rate_limits LIMIT 0").all();
    reportingSchema = "ready";
  } catch {}
  try {
    await env.DB.prepare("SELECT id, submission_id, sender_email, message, consent_at, status, created_at FROM contact_requests LIMIT 0").all();
    await env.DB.prepare("SELECT key, count, expires_at FROM contact_rate_limits LIMIT 0").all();
    contactSchema = "ready";
  } catch {}
  return Response.json({ ok: true, database: "connected", reportingSchema, contactSchema }, { headers });
}
