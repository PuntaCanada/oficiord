// Private export draft: no email, no storage, no arbitrary account identifiers.
import {readAccountSession} from '../../_lib/account-auth.js';
const headers={'cache-control':'private, no-store','x-content-type-options':'nosniff','content-security-policy':"default-src 'none'",'content-disposition':'attachment; filename="oficiord-my-data.json"'};
const reply=(body,status=200)=>Response.json(body,{status,headers});
export async function onRequestGet({env,request}){
 if(env.ACCOUNTS_ENABLED!=='true')return reply({error:'ACCOUNTS_NOT_ENABLED'},503);
 if(!env.DB)return reply({error:'DATABASE_NOT_CONFIGURED'},503);
 try{
  const account=await readAccountSession(env,request);
  if(!account)return reply({error:'AUTH_REQUIRED'},401);
  // Account ID always comes from verified session, never from a user-supplied parameter.
  if(account.role==='customer'){
   const jobs=await env.DB.prepare("SELECT s.id,s.title,s.city,s.category,s.description,s.created_at,s.status FROM account_jobs j JOIN submissions s ON s.id=j.submission_id WHERE j.account_id=? ORDER BY s.created_at DESC LIMIT 100").bind(account.id).all();
   return reply({exportedAt:new Date().toISOString(),account:{email:account.email,role:account.role},jobs:jobs.results||[]});
  }
  if(account.role==='provider'){
   const profiles=await env.DB.prepare('SELECT p.id,p.display_name,p.city,p.category,p.introduction,p.publication_status,p.verification_status FROM account_provider_profiles a JOIN provider_profiles p ON p.id=a.profile_id WHERE a.account_id=? LIMIT 1').bind(account.id).all();
   const proposals=await env.DB.prepare('SELECT o.id,o.submission_id,o.price_dop,o.description,o.status,o.created_at FROM proposals o JOIN account_provider_profiles a ON a.profile_id=o.provider_id WHERE a.account_id=? ORDER BY o.created_at DESC LIMIT 100').bind(account.id).all();
   return reply({exportedAt:new Date().toISOString(),account:{email:account.email,role:account.role},profiles:profiles.results||[],proposals:proposals.results||[]});
  }
  return reply({error:'ROLE_NOT_ALLOWED'},403);
 }catch{return reply({error:'ACCOUNT_SCHEMA_NOT_READY'},503);}
}
export async function onRequestPost(){return reply({error:'EXPORT_REQUESTS_NOT_ENABLED'},503);}
