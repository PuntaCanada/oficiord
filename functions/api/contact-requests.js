// Anonymous, manually mediated contact requests: never expose either email publicly.
const HEADERS={'cache-control':'private, no-store','x-content-type-options':'nosniff'};
const reply=(payload,status=200)=>Response.json(payload,{status,headers:HEADERS});
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const validEmail=s=>typeof s==='string'&&s.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export async function onRequestPost({env,request}){
 if(env.MARKETPLACE_LAUNCH_APPROVED!=='true'||env.LEGAL_READINESS_CONFIRMED!=='true'||env.CONTACT_REQUESTS_ENABLED!=='true')
  return reply({error:'CONTACT_NOT_ENABLED'},503);
 if(!env.DB||!env.TURNSTILE_SECRET||!env.TURNSTILE_SITE_KEY||!env.MODERATION_ADMIN_KEY||env.MODERATION_ADMIN_KEY.length<32)
  return reply({error:'CONTACT_NOT_CONFIGURED'},503);
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return reply({error:'INVALID_ORIGIN'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'INVALID_CONTENT_TYPE'},415);
 if(Number(request.headers.get('content-length')||0)>7000)return reply({error:'TOO_LARGE'},413);
 let body;
 try{const raw=await request.text();if(raw.length>7000)return reply({error:'TOO_LARGE'},413);body=JSON.parse(raw)}
 catch{return reply({error:'INVALID_JSON'},400)}
 if(!body||!UUID.test(body.submissionId||'')||!validEmail(body.senderEmail)||
 typeof body.message!=='string'||body.message.trim().length<15||body.message.length>1200||
 body.consent!==true||body.website||typeof body.turnstileToken!=='string'||body.turnstileToken.length<10||
 body.turnstileToken.length>4096)return reply({error:'INVALID_INPUT'},400);
 // Do not permit phone numbers, email addresses, links or payment credentials inside public-facing messages.
 if(/https?:\/\/|www\.|@|\b(?:\+?1[- .]?)?(?:809|829|849)[- .]?\d{3}[- .]?\d{4}\b/i.test(body.message))
  return reply({error:'REMOVE_CONTACT_DETAILS'},400);
 try{
  const listing=await env.DB.prepare("SELECT id FROM submissions WHERE id=? AND status='approved'").bind(body.submissionId).first();
  if(!listing)return reply({error:'LISTING_NOT_FOUND'},404);
  const form=new FormData();form.set('secret',env.TURNSTILE_SECRET);
  form.set('response',body.turnstileToken);form.set('remoteip',request.headers.get('CF-Connecting-IP')||'unknown');
  const verified=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:form});
  if(!verified.ok||(await verified.json()).success!==true)return reply({error:'ANTI_SPAM_FAILED'},400);
  const ip=request.headers.get('CF-Connecting-IP')||'unknown';
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.TURNSTILE_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const digest=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode('contact:'+ip));
  const hash=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
  const now=Math.floor(Date.now()/1000);
  await env.DB.prepare('DELETE FROM contact_rate_limits WHERE expires_at<?').bind(now).run();
  const slot=await env.DB.prepare(`INSERT INTO contact_rate_limits(key,count,expires_at) VALUES (?,1,?)
   ON CONFLICT(key) DO UPDATE SET
    count=CASE WHEN expires_at<=? THEN 1 ELSE count+1 END,
    expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END
   WHERE expires_at<=? OR count<3 RETURNING count`)
   .bind(hash,now+3600,now,now,now).first();
  if(!slot)return reply({error:'RATE_LIMIT'},429);
  await env.DB.prepare('INSERT INTO contact_requests(id,submission_id,sender_email,message) VALUES(?,?,?,?)')
   .bind(crypto.randomUUID(),body.submissionId,body.senderEmail.trim(),body.message.trim()).run();
  return reply({ok:true,status:'pending',notice:'CONTACT_AWAITS_MANUAL_REVIEW'},202);
 }catch{return reply({error:'CONTACT_DATABASE_NOT_READY'},503)}
}
