// Dashboard data is scoped by the signed-in account, never by a client-provided user ID.
import {readAccountSession} from '../../_lib/account-auth.js';
const reply=(data,status=200)=>Response.json(data,{status,headers:{'cache-control':'private, no-store','x-content-type-options':'nosniff'}});
export async function onRequestGet({env,request}){
 if(env.ACCOUNTS_ENABLED!=='true')return reply({error:'ACCOUNTS_NOT_ENABLED'},503);
 if(!env.DB)return reply({error:'DATABASE_NOT_CONFIGURED'},503);
 try{
  const account=await readAccountSession(env,request);
  if(!account)return reply({error:'AUTH_REQUIRED'},401);
  if(account.role==='customer'){
   const res=await env.DB.prepare("SELECT s.id,s.title,s.city,s.category,s.created_at,s.status FROM account_jobs a JOIN submissions s ON s.id=a.submission_id WHERE a.account_id=? ORDER BY s.created_at DESC LIMIT 50").bind(account.id).all();
   return reply({role:'customer',items:res.results||[]});
  }
  if(account.role==='provider'){
   const profile=await env.DB.prepare("SELECT p.id,p.display_name,p.city,p.category,p.introduction,p.verification_status,p.publication_status FROM account_provider_profiles a JOIN provider_profiles p ON p.id=a.profile_id WHERE a.account_id=? LIMIT 1").bind(account.id).first();
   const offers=await env.DB.prepare("SELECT o.id,o.price_dop,o.status,o.created_at,s.title AS job_title FROM proposals o JOIN account_provider_profiles a ON a.profile_id=o.provider_id JOIN submissions s ON s.id=o.submission_id WHERE a.account_id=? ORDER BY o.created_at DESC LIMIT 50").bind(account.id).all();
   return reply({role:'provider',profile:profile||null,offers:offers.results||[]});
  }
  return reply({error:'ROLE_NOT_ALLOWED'},403);
 }catch{return reply({error:'ACCOUNT_SCHEMA_NOT_READY'},503);}
}
export async function onRequestPost(){return reply({error:'DASHBOARD_WRITES_NOT_ENABLED'},503);}
export async function onRequestPut(){return reply({error:'DASHBOARD_WRITES_NOT_ENABLED'},503);}
export async function onRequestDelete(){return reply({error:'DASHBOARD_WRITES_NOT_ENABLED'},503);}
