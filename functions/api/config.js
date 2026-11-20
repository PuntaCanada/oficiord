export async function onRequestGet({env}) {
  const turnstileConfigured=Boolean(env.TURNSTILE_SITE_KEY&&env.TURNSTILE_SECRET);
  const launchApproved=env.MARKETPLACE_LAUNCH_APPROVED==='true';
  const moderationReady=typeof env.MODERATION_ADMIN_KEY==='string'&&env.MODERATION_ADMIN_KEY.length>=32;
  const submissionsEnabled=launchApproved&&moderationReady&&env.SUBMISSIONS_ENABLED==='true'&&Boolean(env.DB)&&turnstileConfigured;
  const contactRequestsEnabled=launchApproved&&moderationReady&&env.CONTACT_REQUESTS_ENABLED==='true'&&Boolean(env.DB)&&turnstileConfigured;
  const reportsEnabled=env.REPORTS_ENABLED==='true'&&Boolean(env.DB)&&turnstileConfigured;
  return Response.json({
    turnstileConfigured,
    reportsEnabled,
    reportSiteKey:reportsEnabled?env.TURNSTILE_SITE_KEY:null,
    submissionsEnabled,
    contactRequestsEnabled,
    turnstileSiteKey:submissionsEnabled?env.TURNSTILE_SITE_KEY:null
  },{headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
}
