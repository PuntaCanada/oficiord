// No account creation or session issuance. Read-only self endpoint remains disabled.
import { readAccountSession } from '../../_lib/account-auth.js';
const json=(value,status=200)=>Response.json(value,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
export async function onRequestGet({env,request}){
 if(env.ACCOUNTS_ENABLED!=='true')return json({error:'ACCOUNTS_NOT_ENABLED'},503);
 if(!env.DB)return json({error:'DATABASE_NOT_CONFIGURED'},503);
 try{
  const account=await readAccountSession(env,request);
  if(!account)return json({error:'AUTH_REQUIRED'},401);
  return json({account:{id:account.id,email:account.email,role:account.role,emailVerified:!!account.email_verified_at}});
 }catch{return json({error:'ACCOUNT_SCHEMA_NOT_READY'},503);}
}
export async function onRequestPost(){return json({error:'REGISTRATION_NOT_ENABLED'},503);}
export async function onRequestPut(){return json({error:'ACCOUNT_WRITES_NOT_ENABLED'},503);}
export async function onRequestDelete(){return json({error:'ACCOUNT_WRITES_NOT_ENABLED'},503);}
