const HEADERS={"cache-control":"no-store","x-content-type-options":"nosniff","content-type":"application/json; charset=utf-8"};
const reply=(value,status=200)=>Response.json(value,{status,headers:HEADERS});
async function authorized(env,request){
  const secret=env.MODERATION_ADMIN_KEY;
  if(typeof secret!=="string"||secret.length<32)return false;
  const input=request.headers.get("authorization")||"";
  if(!input.startsWith("Bearer ")||input.length>512)return false;
  const given=input.slice(7);
  if(given.length<32)return false;
  const encoder=new TextEncoder();
  const [a,b]=await Promise.all([crypto.subtle.digest("SHA-256",encoder.encode(given)),crypto.subtle.digest("SHA-256",encoder.encode(secret))]);
  const x=new Uint8Array(a),y=new Uint8Array(b);
  let diff=0;for(let i=0;i<x.length;i++)diff|=x[i]^y[i];
  return diff===0;
}
async function gate({env,request}){
 if(!env.DB||!env.MODERATION_ADMIN_KEY||env.MODERATION_ADMIN_KEY.length<32)return reply({error:"ADMIN_NOT_CONFIGURED"},503);
 if(!(await authorized(env,request)))return reply({error:"UNAUTHORIZED"},401);
 return null;
}
export async function onRequestGet(context){
 const rejected=await gate(context);if(rejected)return rejected;
 try{
  const status=new URL(context.request.url).searchParams.get("status")||"pending";
  if(!["pending","approved","rejected"].includes(status))return reply({error:"INVALID_STATUS"},400);
  const result=await context.env.DB.prepare("SELECT id,kind,title,city,category,description,created_at,status FROM submissions WHERE status=? ORDER BY created_at DESC LIMIT 100").bind(status).all();
  return reply({items:result.results||[]});
 }catch{return reply({error:"DATABASE_ERROR"},500);}
}
export async function onRequestPost(context){
 const rejected=await gate(context);if(rejected)return rejected;
 const {env,request}=context;
 const origin=request.headers.get("origin");
 if(origin&&origin!==new URL(request.url).origin)return reply({error:"INVALID_ORIGIN"},403);
 if(!request.headers.get("content-type")?.startsWith("application/json"))return reply({error:"INVALID_CONTENT_TYPE"},415);
 if(Number(request.headers.get("content-length")||0)>1000)return reply({error:"TOO_LARGE"},413);
 let data;try{const raw=await request.text();if(raw.length>1000)return reply({error:"TOO_LARGE"},413);data=JSON.parse(raw);}catch{return reply({error:"INVALID_JSON"},400);}
 if(!data||typeof data.id!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id)||!["approved","rejected"].includes(data.status))return reply({error:"INVALID_INPUT"},400);
 try{
  const result=await env.DB.prepare("UPDATE submissions SET status=? WHERE id=? AND (status='pending' OR (status='approved' AND ?='rejected'))").bind(data.status,data.id,data.status).run();
  return (result.meta?.changes||0)===1?reply({ok:true,status:data.status}):reply({error:"NOT_FOUND_OR_NOT_PENDING"},409);
 }catch{return reply({error:"DATABASE_ERROR"},500);}
}

export async function onRequestDelete(context){
 const rejected=await gate(context);if(rejected)return rejected;
 const {env,request}=context;
 const origin=request.headers.get("origin");
 if(origin&&origin!==new URL(request.url).origin)return reply({error:"INVALID_ORIGIN"},403);
 if(!request.headers.get("content-type")?.startsWith("application/json"))return reply({error:"INVALID_CONTENT_TYPE"},415);
 if(Number(request.headers.get("content-length")||0)>1000)return reply({error:"TOO_LARGE"},413);
 let data;try{const raw=await request.text();if(raw.length>1000)return reply({error:"TOO_LARGE"},413);data=JSON.parse(raw);}catch{return reply({error:"INVALID_JSON"},400);}
 if(!data||typeof data.id!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id)||data.confirm!=="DELETE")return reply({error:"INVALID_INPUT"},400);
 try{
  const result=await env.DB.prepare("DELETE FROM submissions WHERE id=?").bind(data.id).run();
  return (result.meta?.changes||0)===1?reply({ok:true,deleted:true}):reply({error:"NOT_FOUND"},404);
 }catch{return reply({error:"DATABASE_ERROR"},500);}
}
