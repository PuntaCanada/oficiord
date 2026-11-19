export async function onRequestGet({env}) {
  const turnstileConfigured=Boolean(env.TURNSTILE_SITE_KEY&&env.TURNSTILE_SECRET);
  const submissionsEnabled=env.SUBMISSIONS_ENABLED==='true'&&Boolean(env.DB)&&turnstileConfigured;
  const reportsEnabled=env.REPORTS_ENABLED==='true'&&Boolean(env.DB)&&turnstileConfigured;
  return Response.json({
    turnstileConfigured,
    reportsEnabled,
    reportSiteKey:reportsEnabled?env.TURNSTILE_SITE_KEY:null,
    submissionsEnabled,
    turnstileSiteKey:submissionsEnabled?env.TURNSTILE_SITE_KEY:null
  },{headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
}
