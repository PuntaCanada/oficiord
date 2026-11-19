const HEADERS={'cache-control':'no-store','x-content-type-options':'nosniff'};
const reply=(value,status=200)=>Response.json(value,{status,headers:HEADERS});
const REASONS=new Set(['spam','fraud','inappropriate','privacy','other']);
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function onRequestPost({env,request}){
 // Reporting intake is independent from, and cannot activate, new job submission intake.
 if(env.REPORTS_ENABLED!=='true')return reply({error:'REPORTS_NOT_ENABLED'},503);
 if(!env.DB||!env.TURNSTILE_SECRET||!env.TURNSTILE_SITE_KEY)return reply({error:'REPORTS_NOT_CONFIGURED'},503);
 const origin=request.headers.get('origin');
 if(origin && origin!==new URL(request.url).origin)return reply({error:'INVALID_ORIGIN'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'INVALID_CONTENT_TYPE'},415);
 if(Number(request.headers.get('content-length')||0)>3000)return reply({error:'TOO_LARGE'},413);
 let data;
 try{const raw=await request.text();if(raw.length>3000)return reply({error:'TOO_LARGE'},413);data=JSON.parse(raw);}
 catch{return reply({error:'INVALID_JSON'},400);}
 if(!data||typeof data.submissionId!=='string'||!UUID.test(data.submissionId)||!REASONS.has(data.reason)||
 typeof data.details!=='string'||data.details.length>1000||typeof data.turnstileToken!=='string'||data.turnstileToken.length<10||
 data.turnstileToken.length>4096||data.website||data.consent!==true)return reply({error:'INVALID_INPUT'},400);
 try{
  // Only existing publicly visible listings may be reported.
  const item=await env.DB.prepare("SELECT id FROM submissions WHERE id=? AND status='approved'").bind(data.submissionId).first();
  if(!item)return reply({error:'LISTING_NOT_FOUND'},404);
  const form=new FormData();
  form.set('secret',env.TURNSTILE_SECRET);form.set('response',data.turnstileToken);
  const ip=request.headers.get('CF-Connecting-IP')||'unknown';
  form.set('remoteip',ip);
  const verify=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:form});
  if(!verify.ok||(await verify.json()).success!==true)return reply({error:'ANTI_SPAM_FAILED'},400);
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.TURNSTILE_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const digest=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode('report:'+ip));
  const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  const now=Math.floor(Date.now()/1000);
  const counter=await env.DB.prepare('SELECT count FROM report_rate_limits WHERE key=? AND expires_at>?').bind(hash,now).first();
  if(counter?.count>=5)return reply({error:'RATE_LIMIT'},429);
  await env.DB.prepare('INSERT INTO report_rate_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at<=? THEN 1 ELSE count+1 END,expires_at=CASE WHEN expires_at<=? THEN ? ELSE expires_at END').bind(hash,now+3600,now,now,now+3600).run();
  const id=crypto.randomUUID();
  await env.DB.prepare("INSERT INTO reports(id,submission_id,reason,details) VALUES(?,?,?,?)").bind(id,data.submissionId,data.reason,data.details.trim()).run();
  return reply({ok:true,status:'pending'},202);
 }catch{return reply({error:'SERVER_ERROR'},500);}
}
