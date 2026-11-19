// Planned marketplace read endpoint. No public registrations or writes.
const json=(body,status=200)=>Response.json(body,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
export async function onRequestGet({env,request}){
 if(env.MARKETPLACE_READS_ENABLED!=='true')return json({error:'MARKETPLACE_NOT_LAUNCHED'},503);
 if(!env.DB)return json({error:'DATABASE_NOT_CONFIGURED'},503);
 const params=new URL(request.url).searchParams;
 const city=params.get('city')||'';
 const category=params.get('category')||'';
 if(city.length>80||category.length>80)return json({error:'INVALID_FILTER'},400);
 try{
  const result=await env.DB.prepare("SELECT id,display_name,city,category,introduction,verification_status FROM provider_profiles WHERE publication_status='approved' AND verification_status IN ('unverified','verified') AND (?='' OR city=?) AND (?='' OR category=?) ORDER BY created_at DESC LIMIT 50").bind(city,city,category,category).all();
  return json({items:result.results||[]});
 }catch{return json({error:'SCHEMA_NOT_READY'},503);}
}
export async function onRequestPost(){return json({error:'REGISTRATION_NOT_ENABLED'},503);}
