// Public readiness response exposes only booleans and the public Turnstile site key.
export async function onRequestGet({env}) {
  const turnstileConfigured=Boolean(env.TURNSTILE_SITE_KEY&&env.TURNSTILE_SECRET);
  const launchApproved=env.MARKETPLACE_LAUNCH_APPROVED==='true'&&env.LEGAL_READINESS_CONFIRMED==='true';
  const moderationReady=typeof env.MODERATION_ADMIN_KEY==='string'&&env.MODERATION_ADMIN_KEY.length>=32;
  let submissionsSchemaReady=false, contactSchemaReady=false, reportSchemaReady=false;
  if(env.DB && (env.SUBMISSIONS_ENABLED==='true'||env.CONTACT_REQUESTS_ENABLED==='true'||env.REPORTS_ENABLED==='true')){
    try{await env.DB.prepare('SELECT id FROM submissions LIMIT 1').first();await env.DB.prepare('SELECT key FROM rate_limits LIMIT 1').first();submissionsSchemaReady=true}catch{}
    if(submissionsSchemaReady){
      try{await env.DB.prepare('SELECT id FROM contact_requests LIMIT 1').first();await env.DB.prepare('SELECT key FROM contact_rate_limits LIMIT 1').first();contactSchemaReady=true}catch{}
      try{await env.DB.prepare('SELECT id FROM reports LIMIT 1').first();await env.DB.prepare('SELECT key FROM report_rate_limits LIMIT 1').first();reportSchemaReady=true}catch{}
    }
  }
  const submissionsEnabled=launchApproved&&moderationReady&&submissionsSchemaReady&&turnstileConfigured&&env.SUBMISSIONS_ENABLED==='true';
  const contactRequestsEnabled=launchApproved&&moderationReady&&contactSchemaReady&&turnstileConfigured&&env.CONTACT_REQUESTS_ENABLED==='true';
  const reportsEnabled=reportSchemaReady&&turnstileConfigured&&env.REPORTS_ENABLED==='true';
  return Response.json({
    turnstileConfigured,
    reportsEnabled,
    reportSiteKey:reportsEnabled?env.TURNSTILE_SITE_KEY:null,
    submissionsEnabled,
    contactRequestsEnabled,
    turnstileSiteKey:(submissionsEnabled||contactRequestsEnabled)?env.TURNSTILE_SITE_KEY:null
  },{headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
}
