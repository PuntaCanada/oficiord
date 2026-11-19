// Public job detail only. Contact details and customer identities are never returned.
const json=(body,status=200)=>Response.json(body,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function onRequestGet({env,request}){
 if(env.MARKETPLACE_READS_ENABLED!=='true')return json({error:'MARKETPLACE_NOT_LAUNCHED'},503);
 if(!env.DB)return json({error:'DATABASE_NOT_CONFIGURED'},503);
 const id=new URL(request.url).searchParams.get('id')||'';
 if(!UUID.test(id))return json({error:'INVALID_ID'},400);
 try{
  const item=await env.DB.prepare("SELECT s.id,s.title,s.city,s.category,s.description,s.created_at,j.preferred_date,j.estimated_budget_dop,j.status AS job_status FROM submissions s JOIN job_details j ON j.submission_id=s.id WHERE s.id=? AND s.kind='job' AND s.status='approved' AND j.status='open'").bind(id).first();
  return item?json({item}):json({error:'NOT_FOUND'},404);
 }catch{return json({error:'SCHEMA_NOT_READY'},503);}
}
export async function onRequestPost(){return json({error:'JOB_DETAILS_WRITE_DISABLED'},503);}
