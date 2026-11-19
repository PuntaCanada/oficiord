export async function onRequestGet({env}) {
  const enabled=env.SUBMISSIONS_ENABLED==='true'&&Boolean(env.DB&&env.TURNSTILE_SITE_KEY&&env.TURNSTILE_SECRET);
  return Response.json({
    submissionsEnabled:enabled,
    turnstileSiteKey:enabled?env.TURNSTILE_SITE_KEY:null
  },{headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
}
