// Test-only policy exercise. No production flags, DB writes, secrets or network.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {isAllowed,ownsJob,ownsProfile,safeMutationRequest,readAccountSession} from '../functions/_lib/account-auth.js';
import * as proposals from '../functions/api/marketplace/proposals.js';
import * as jobsApi from '../functions/api/marketplace/jobs.js';
import * as profilesApi from '../functions/api/marketplace/profiles.js';
import * as login from '../functions/api/account/login.js';
import * as privacy from '../functions/api/account/privacy.js';
import * as submissions from '../functions/api/submissions.js';
import * as reports from '../functions/api/reports.js';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const customer={id:'customer-one',role:'customer',status:'active',email_verified_at:'2026-01-01'};
const otherCustomer={...customer,id:'customer-two'};
const provider={id:'professional-one',role:'provider',status:'active',email_verified_at:'2026-01-01'};
const otherProvider={...provider,id:'professional-two'};
const calls=[];
const db={prepare(sql){return {bind(...args){calls.push({sql,args});return {async first(){
  if(sql.includes('FROM account_jobs'))return args[0]==='job-owned'&&args[1]==='customer-one'?{owned:1}:null;
  if(sql.includes('FROM account_provider_profiles'))return args[0]==='profile-owned'&&args[1]==='professional-one'?{owned:1}:null;
  throw new Error('Unexpected ownership SQL: '+sql);
}}}}}};
for(const [account,role,expect] of [[customer,'customer',true],[provider,'customer',false],[provider,'provider',true],[otherCustomer,'provider',false],[null,'customer',false]]){
 assert.equal(isAllowed(account,role),expect);
}
assert.equal(isAllowed({...customer,status:'pending'},'customer'),false);
assert.equal(await ownsJob({DB:db},customer,'job-owned'),true);
assert.equal(await ownsJob({DB:db},otherCustomer,'job-owned'),false);
assert.equal(await ownsJob({DB:db},provider,'job-owned'),false);
assert.equal(await ownsJob({DB:db},customer,'foreign-job'),false);
assert.equal(await ownsProfile({DB:db},provider,'profile-owned'),true);
assert.equal(await ownsProfile({DB:db},otherProvider,'profile-owned'),false);
assert.equal(await ownsProfile({DB:db},customer,'profile-owned'),false);
assert.equal(await ownsProfile({DB:db},provider,'foreign-profile'),false);
assert.ok(calls.every(c=>c.sql.includes('account_id=?')&&c.args.length===2));
assert.ok(calls.every(c=>c.sql.includes('LIMIT 1')));
assert.ok(calls.every(c=>!c.sql.includes('UPDATE ')&&!c.sql.includes('INSERT ')&&!c.sql.includes('DELETE ')));
const url='https://oficiord.pages.dev/api/account/dashboard?account_id=someone-else';
const request=(origin,site)=>new Request(url,{method:'POST',headers:{
 ...(origin===null?{}:{origin}),...(site===null?{}:{'sec-fetch-site':site})
}});
assert.equal(safeMutationRequest(request('https://oficiord.pages.dev','same-origin')),true);
for(const [origin,site] of [
 ['https://attacker.invalid','cross-site'],['https://oficiord.pages.dev','same-site'],
 [null,'same-origin'],['https://oficiord.pages.dev.evil.invalid','same-origin'],
 ['http://oficiord.pages.dev','same-origin']
])assert.equal(safeMutationRequest(request(origin,site)),false);
assert.equal(await readAccountSession({DB:db},new Request(url)),null,'No unauthenticated session');
assert.equal(await readAccountSession({ACCOUNTS_ENABLED:'true',DB:db},new Request(url)),null);
const closed={DB:{prepare(){throw new Error('DB must not be touched by a disabled write route');}},SUBMISSIONS_ENABLED:'false',REPORTS_ENABLED:'false'};
const base=new Request('https://oficiord.pages.dev/api/submissions',{method:'POST'});
const checks=[
 [await proposals.onRequestPost(),503,'PROPOSALS_NOT_ENABLED'],
 [await jobsApi.onRequestPost(),503,'JOB_DETAILS_WRITE_DISABLED'],
 [await profilesApi.onRequestPost(),503,'REGISTRATION_NOT_ENABLED'],
 [await login.onRequestPost(),503,'LOGIN_NOT_ENABLED'],
 [await privacy.onRequestPost(),503,'PRIVACY_REQUESTS_NOT_ENABLED'],
 [await submissions.onRequestPost({env:closed,request:base}),503,'SUBMISSIONS_NOT_ENABLED'],
 [await reports.onRequestPost({env:closed,request:base}),503,'REPORTS_NOT_ENABLED']
];
for(const [response,status,error] of checks){
 assert.equal(response.status,status,error);
 assert.equal((await response.json()).error,error);
 assert.equal(response.headers.get('cache-control'),'no-store');
}
for(const [api,endpoint] of [[jobsApi,'jobs'],[profilesApi,'profiles']]){
 const response=await api.onRequestGet({env:closed,request:new Request('https://oficiord.pages.dev/api/marketplace/'+endpoint)});
 assert.equal(response.status,503);
 assert.equal((await response.json()).error,'MARKETPLACE_NOT_LAUNCHED');
}
const sources=['functions/api/account/dashboard.js','functions/api/account/export.js','functions/api/account/sessions.js'];
for(const path of sources){
 const s=await read(path);
 assert.match(s,/env\.ACCOUNTS_ENABLED!=='true'/,path+' must fail closed');
 assert.ok(s.includes('readAccountSession'),path+' requires a validated session');
 assert.doesNotMatch(s,/request\.url\).*account_id|params\.get\('account_id'\)/);
}
console.log('PASS: cross-role owner checks, foreign-ID and cross-site denial, read-only gate, and seven closed production write routes');
