export async function onRequestGet({env}) {
  const turnstileConfigured=Boolean(env.TURNSTILE_SITE_KEY&&env.TURNSTILE_SECRET);
  const submissionsEnabled=env.SUBMISSIONS_ENABLED==='true'&&Boolean(env.DB)&&turnstileConfigured;
  return Response.json({
    turnstileConfigured,
    submissionsEnabled,
    turnstileSiteKey:submissionsEnabled?env.TURNSTILE_SITE_KEY:null
  },{headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
}
