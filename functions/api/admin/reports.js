const HEADERS={'cache-control':'no-store','x-content-type-options':'nosniff'};
const reply=(value,status=200)=>Response.json(value,{status,headers:HEADERS});
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function gate({env,request}){
 const secret=env.MODERATION_ADMIN_KEY;
 if(!env.DB||typeof secret!=='string'||secret.length<32)return reply({error:'ADMIN_NOT_CONFIGURED'},503);
 const header=request.headers.get('authorization')||'';
 if(!header.startsWith('Bearer ')||header.length>512)return reply({error:'UNAUTHORIZED'},401);
 const token=header.slice(7);
 if(token.length<32)return reply({error:'UNAUTHORIZED'},401);
 const encoder=new TextEncoder();
 const [a,b]=await Promise.all([crypto.subtle.digest('SHA-256',encoder.encode(secret)),crypto.subtle.digest('SHA-256',encoder.encode(token))]);
 const x=new Uint8Array(a),y=new Uint8Array(b);
 let mismatch=0;for(let i=0;i<x.length;i++)mismatch|=x[i]^y[i];
 return mismatch===0?null:reply({error:'UNAUTHORIZED'},401);
}
export async function onRequestGet(context){
 const denial=await gate(context);if(denial)return denial;
 const status=new URL(context.request.url).searchParams.get('status')||'pending';
 if(!['pending','reviewed','dismissed'].includes(status))return reply({error:'INVALID_STATUS'},400);
 try{
  const results=await context.env.DB.prepare("SELECT r.id,r.submission_id,r.reason,r.details,r.status,r.created_at,s.title AS listing_title,s.status AS listing_status FROM reports r LEFT JOIN submissions s ON s.id=r.submission_id WHERE r.status=? ORDER BY r.created_at DESC LIMIT 100").bind(status).all();
  return reply({items:results.results||[]});
 }catch{return reply({error:'REPORT_TABLE_NOT_READY'},503);}
}
export async function onRequestPost(context){
 const denial=await gate(context);if(denial)return denial;
 const {request,env}=context;
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return reply({error:'INVALID_ORIGIN'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'INVALID_CONTENT_TYPE'},415);
 if(Number(request.headers.get('content-length')||0)>1000)return reply({error:'TOO_LARGE'},413);
 let data;try{const raw=await request.text();if(raw.length>1000)return reply({error:'TOO_LARGE'},413);data=JSON.parse(raw);}catch{return reply({error:'INVALID_JSON'},400);}
 if(!data||typeof data.id!=='string'||!UUID.test(data.id)||!['reviewed','dismissed'].includes(data.status))return reply({error:'INVALID_INPUT'},400);
 try{
  const result=await env.DB.prepare("UPDATE reports SET status=?,reviewed_at=datetime('now') WHERE id=? AND status='pending'").bind(data.status,data.id).run();
  return result.meta?.changes===1?reply({ok:true,status:data.status}):reply({error:'NOT_PENDING'},409);
 }catch{return reply({error:'REPORT_TABLE_NOT_READY'},503);}
}
