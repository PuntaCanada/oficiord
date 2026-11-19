const CITIES=['Higüey','Bávaro','Punta Cana','La Romana','Santo Domingo','Santiago','Otras zonas'];
const CATEGORIES=['Plomería','Electricidad','Aire acondicionado','Reparación de electrodomésticos','Pintura','Limpieza','Carpintería','Otros'];
const HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
const send=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:HEADERS});
const valid=(s,min,max)=>typeof s==='string'&&s.trim().length>=min&&s.trim().length<=max;
export async function onRequestGet({env,request}){
 if(!env.DB)return send({error:'DATABASE_NOT_CONFIGURED'},503);
 try{
  const p=new URL(request.url).searchParams;
  const city=p.get('city')||'',category=p.get('category')||'',kind=p.get('kind')||'job';
  if((city&&!CITIES.includes(city))||(category&&!CATEGORIES.includes(category))||!['job','professional'].includes(kind))return send({error:'INVALID_FILTER'},400);
  const results=await env.DB.prepare("SELECT id,kind,title,city,category,description,created_at FROM submissions WHERE status='approved' AND kind=? AND (?='' OR city=?) AND (?='' OR category=?) ORDER BY created_at DESC LIMIT 50").bind(kind,city,city,category,category).all();
  return send({items:results.results||[]});
 }catch{return send({error:'SERVER_ERROR'},500);}
}
export async function onRequestPost({env,request}){
 if(env.SUBMISSIONS_ENABLED!=='true')return send({error:'SUBMISSIONS_NOT_ENABLED'},503);
 if(!env.DB)return send({error:'DATABASE_NOT_CONFIGURED'},503);
 if(!env.TURNSTILE_SECRET||!env.TURNSTILE_SITE_KEY)return send({error:'ANTI_SPAM_NOT_CONFIGURED'},503);
 if(Number(request.headers.get('content-length')||0)>12000)return send({error:'TOO_LARGE'},413);
 let body;try{const txt=await request.text();if(txt.length>12000)return send({error:'TOO_LARGE'},413);body=JSON.parse(txt);}catch{return send({error:'INVALID_JSON'},400);}
 if(!body||!['job','professional'].includes(body.kind)||!valid(body.title,5,80)||!valid(body.description,10,800)||!CITIES.includes(body.city)||!CATEGORIES.includes(body.category)||!valid(body.contact_email,5,254)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contact_email)||body.website||body.company_url||body.consent!==true)return send({error:'INVALID_INPUT'},400);
 if(!valid(body.turnstileToken,10,4096))return send({error:'ANTI_SPAM_REQUIRED'},400);
 const ip=request.headers.get('CF-Connecting-IP')||'unknown';
 try{
  const form=new FormData();form.append('secret',env.TURNSTILE_SECRET);form.append('response',body.turnstileToken);form.append('remoteip',ip);
  const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:form});
  if(!verification.ok||(await verification.json()).success!==true)return send({error:'ANTI_SPAM_FAILED'},400);
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.TURNSTILE_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const mac=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(ip));
  const hashed=[...new Uint8Array(mac)].map(b=>b.toString(16).padStart(2,'0')).join('');
  const now=Math.floor(Date.now()/1000);
  await env.DB.prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(now).run();
  const existing=await env.DB.prepare('SELECT count FROM rate_limits WHERE key=? AND expires_at>=?').bind(hashed,now).first();
  if(existing&&existing.count>=3)return send({error:'RATE_LIMIT'},429);
  await env.DB.prepare('INSERT INTO rate_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at < ? THEN 1 ELSE count+1 END, expires_at=CASE WHEN expires_at < ? THEN ? ELSE expires_at END').bind(hashed,now+3600,now+3600,now,now,now+3600).run();
  const id=crypto.randomUUID();
  await env.DB.prepare("INSERT INTO submissions(id,kind,title,city,category,description,contact_email,status) VALUES(?,?,?,?,?,?,?,'pending')").bind(id,body.kind,body.title.trim(),body.city,body.category,body.description.trim(),body.contact_email.trim()).run();
  return send({ok:true,id,status:'pending'},202);
 }catch{return send({error:'SERVER_ERROR'},500);}
}