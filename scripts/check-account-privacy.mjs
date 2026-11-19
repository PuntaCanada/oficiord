// Synthetic tests for fail-closed private data endpoints; never contacts production.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const loader=async name=>readFile(new URL('../'+name,import.meta.url),'utf8');
const auth=await loader('functions/_lib/account-auth.js');
const authURL='data:text/javascript;base64,'+Buffer.from(auth).toString('base64');
async function endpoint(path){
 const source=(await loader(path)).replace("'../../_lib/account-auth.js'","'"+authURL+"'");
 return import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
}
const [exportsAPI,sessionsAPI,privacyAPI]=await Promise.all([
 endpoint('functions/api/account/export.js'),
 endpoint('functions/api/account/sessions.js'),
 endpoint('functions/api/account/privacy.js')
]);
const request=new Request('https://oficiord.pages.dev/api/account/export');
for(const api of [exportsAPI,sessionsAPI]){
 const response=await api.onRequestGet({env:{},request});
 assert.equal(response.status,503);
 assert.equal((await response.json()).error,'ACCOUNTS_NOT_ENABLED');
}
for(const fn of [privacyAPI.onRequestGet,privacyAPI.onRequestPost,privacyAPI.onRequestDelete]){
 const response=await fn();
 assert.equal(response.status,503);
 assert.equal((await response.json()).error,'PRIVACY_REQUESTS_NOT_ENABLED');
}
const token='a'.repeat(64);
const calls=[];
let account={id:'customer-1',role:'customer',status:'active',email:'customer@example.invalid',email_verified_at:'2026-01-01'};
const DB={prepare(sql){return {bind(...params){calls.push({sql,params});return {
 async first(){if(sql.includes('account_sessions'))return account;return null;},
 async all(){
  if(sql.includes('FROM account_jobs'))return {results:[{id:'owned-job',title:'Own job'}]};
  if(sql.includes('FROM account_provider_profiles')||sql.includes('FROM proposals'))return {results:[{id:'owned-item'}]};
  if(sql.includes('FROM account_sessions WHERE'))return {results:[{created_at:'2026-01-01',expires_at:9999999999,revoked:0}]};
  throw new Error('Unexpected SQL '+sql);
 }
};}}}};
const env={ACCOUNTS_ENABLED:'true',DB};
const authorized=new Request('https://oficiord.pages.dev/api/account/export?accountId=another-person',{headers:{cookie:'__Host-oficiord_session='+token}});
const response=await exportsAPI.onRequestGet({env,request:authorized});
assert.equal(response.status,200);
assert.match(response.headers.get('cache-control'),/no-store/);
assert.ok(response.headers.get('content-disposition')?.startsWith('attachment'));
const data=await response.json();
assert.equal(data.jobs[0].id,'owned-job');
assert.equal(data.account.email,'customer@example.invalid');
assert.equal(calls.at(-1).params[0],'customer-1');
assert.equal(calls.some(c=>c.params.includes('another-person')),false);
account={id:'provider-2',role:'provider',status:'active',email:'provider@example.invalid',email_verified_at:'2026-01-01'};
const provider=await (await exportsAPI.onRequestGet({env,request:authorized})).json();
assert.equal(provider.account.role,'provider');
assert.ok(provider.profiles&&provider.proposals);
assert.ok(calls.filter(x=>x.sql.includes('FROM proposals')).every(x=>x.params[0]==='provider-2'));
const sessions=await sessionsAPI.onRequestGet({env,request:authorized});
assert.equal(sessions.status,200);
const info=await sessions.json();
assert.equal(info.sessions[0].revoked,0);
assert.equal(JSON.stringify(info).includes('token_hash'),false);
assert.equal(JSON.stringify(info).includes(token),false);
assert.ok(calls.filter(x=>x.sql.includes('FROM account_sessions WHERE')).every(x=>x.params[0]==='provider-2'));
const forbidden=new Request('https://oficiord.pages.dev/api/account/export');
assert.equal((await exportsAPI.onRequestGet({env,request:forbidden})).status,401);
for(const api of [exportsAPI,sessionsAPI]){
 assert.equal((await api.onRequestPost()).status,503);
}
assert.equal((await sessionsAPI.onRequestDelete()).status,503);
console.log('PASS: disabled privacy intake, owner-only export, session redaction, no writes, no unauthorized access');
