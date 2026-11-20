// Private moderator inbox for manually relaying legitimate customer/provider enquiries.
// Deliberately NO automated sending and NO public endpoint to retrieve email addresses.
const HEADERS={'cache-control':'private, no-store','x-content-type-options':'nosniff'};
const reply=(data,status=200)=>Response.json(data,{status,headers:HEADERS});
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function gate({env,request}){
 const secret=env.MODERATION_ADMIN_KEY;
 if(!env.DB||typeof secret!=='string'||secret.length<32)return reply({error:'ADMIN_NOT_CONFIGURED'},503);
 const header=request.headers.get('authorization')||'';
 if(!header.startsWith('Bearer ')||header.length>512)return reply({error:'UNAUTHORIZED'},401);
 const token=header.slice(7);
 if(token.length<32)return reply({error:'UNAUTHORIZED'},401);
 const e=new TextEncoder();
 const [a,b]=await Promise.all([crypto.subtle.digest('SHA-256',e.encode(token)),crypto.subtle.digest('SHA-256',e.encode(secret))]);
 let diff=0;const x=new Uint8Array(a),y=new Uint8Array(b);
 for(let i=0;i<x.length;i++)diff|=x[i]^y[i];
 return diff?reply({error:'UNAUTHORIZED'},401):null;
}
export async function onRequestGet(ctx){
 const denied=await gate(ctx);if(denied)return denied;
 const status=new URL(ctx.request.url).searchParams.get('status')||'pending';
 if(!['pending','handled','rejected'].includes(status))return reply({error:'INVALID_STATUS'},400);
 try{
  const result=await ctx.env.DB.prepare(
   'SELECT c.id,c.submission_id,c.sender_email,c.message,c.status,c.created_at,s.title AS listing_title,s.kind AS listing_kind,s.contact_email AS listing_contact_email,s.status AS listing_status FROM contact_requests c LEFT JOIN submissions s ON s.id=c.submission_id WHERE c.status=? ORDER BY c.created_at DESC LIMIT 100'
  ).bind(status).all();
  return reply({items:result.results||[]});
 }catch{return reply({error:'CONTACT_DATABASE_NOT_READY'},503)}
}
export async function onRequestPost(ctx){
 const denied=await gate(ctx);if(denied)return denied;
 const {request,env}=ctx;
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return reply({error:'INVALID_ORIGIN'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'INVALID_CONTENT_TYPE'},415);
 if(Number(request.headers.get('content-length')||0)>1000)return reply({error:'TOO_LARGE'},413);
 let data;try{const raw=await request.text();if(raw.length>1000)return reply({error:'TOO_LARGE'},413);data=JSON.parse(raw)}catch{return reply({error:'INVALID_JSON'},400)}
 if(!data||!UUID.test(data.id||'')||!['handled','rejected'].includes(data.status))return reply({error:'INVALID_INPUT'},400);
 try{
  const result=await env.DB.prepare("UPDATE contact_requests SET status=? WHERE id=? AND status='pending'").bind(data.status,data.id).run();
  return result.meta?.changes===1?reply({ok:true,status:data.status}):reply({error:'NOT_PENDING'},409);
 }catch{return reply({error:'CONTACT_DATABASE_NOT_READY'},503)}
}
export async function onRequestDelete(ctx){
 const denied=await gate(ctx);if(denied)return denied;
 const {request,env}=ctx;
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return reply({error:'INVALID_ORIGIN'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'INVALID_CONTENT_TYPE'},415);
 let data;try{const raw=await request.text();if(raw.length>1000)return reply({error:'TOO_LARGE'},413);data=JSON.parse(raw)}catch{return reply({error:'INVALID_JSON'},400)}
 if(!data||!UUID.test(data.id||'')||data.confirm!=='DELETE')return reply({error:'INVALID_INPUT'},400);
 try{
  const result=await env.DB.prepare('DELETE FROM contact_requests WHERE id=?').bind(data.id).run();
  return result.meta?.changes===1?reply({ok:true,deleted:true}):reply({error:'NOT_FOUND'},404);
 }catch{return reply({error:'CONTACT_DATABASE_NOT_READY'},503)}
}
