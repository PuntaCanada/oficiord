// Read-only own session metadata; raw tokens, hashes and other users' sessions never leave D1.
import {readAccountSession} from '../../_lib/account-auth.js';
const reply=(body,status=200)=>Response.json(body,{status,headers:{'cache-control':'private, no-store','x-content-type-options':'nosniff'}});
export async function onRequestGet({env,request}){
 if(env.ACCOUNTS_ENABLED!=='true')return reply({error:'ACCOUNTS_NOT_ENABLED'},503);
 if(!env.DB)return reply({error:'DATABASE_NOT_CONFIGURED'},503);
 try{
  const account=await readAccountSession(env,request);
  if(!account)return reply({error:'AUTH_REQUIRED'},401);
  const sessions=await env.DB.prepare("SELECT created_at,expires_at,CASE WHEN revoked_at IS NULL THEN 0 ELSE 1 END AS revoked FROM account_sessions WHERE account_id=? ORDER BY created_at DESC LIMIT 20").bind(account.id).all();
  return reply({sessions:sessions.results||[]});
 }catch{return reply({error:'ACCOUNT_SCHEMA_NOT_READY'},503);}
}
export async function onRequestPost(){return reply({error:'SESSION_CHANGES_NOT_ENABLED'},503);}
export async function onRequestDelete(){return reply({error:'SESSION_CHANGES_NOT_ENABLED'},503);}
