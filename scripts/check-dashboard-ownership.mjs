// Offline dashboard ownership test with imaginary identities and no production database.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const auth=await read('functions/_lib/account-auth.js');
const authURL='data:text/javascript;base64,'+Buffer.from(auth).toString('base64');
const dashboard=(await read('functions/api/account/dashboard.js')).replace("'../../_lib/account-auth.js'","'"+authURL+"'");
const api=await import('data:text/javascript;base64,'+Buffer.from(dashboard).toString('base64'));
const token='a'.repeat(64);
let account={id:'cust-a',role:'customer',email:'one@example.invalid',status:'active',email_verified_at:'2026-01-01'};
let queries=[];
const db={prepare(sql){return {bind(...params){queries.push({sql,params});return {
 async first(){if(sql.includes('FROM account_sessions'))return account;
  if(sql.includes('FROM account_provider_profiles'))return {id:'prof-b',display_name:'Provider B'};return null;},
 async all(){if(sql.includes('FROM account_jobs'))return {results:[{id:'job-a',title:'My test job'}]};
  if(sql.includes('FROM proposals'))return {results:[{id:'offer-b'}]};throw Error('Unexpected SQL');}
};}}}};
const env={ACCOUNTS_ENABLED:'true',DB:db};
const request=new Request('https://oficiord.pages.dev/api/account/dashboard?account_id=cust-other&role=provider',{headers:{cookie:'__Host-oficiord_session='+token}});
const disabled=await api.onRequestGet({env:{DB:db},request});
assert.equal(disabled.status,503);
assert.equal((await disabled.json()).error,'ACCOUNTS_NOT_ENABLED');
const first=await api.onRequestGet({env,request});
assert.equal(first.status,200);
assert.equal(first.headers.get('cache-control'),'private, no-store');
const result1=await first.json();
assert.equal(result1.role,'customer');
assert.equal(result1.items[0].id,'job-a');
assert.ok(queries.some(x=>x.sql.includes('FROM account_jobs')&&x.params[0]==='cust-a'));
assert.ok(queries.every(x=>!x.params.includes('cust-other')));
assert.ok(queries.every(x=>!x.params.includes('provider')));
queries=[];
account={id:'pro-b',role:'provider',email:'two@example.invalid',status:'active',email_verified_at:'2026-01-01'};
const second=await api.onRequestGet({env,request});
assert.equal(second.status,200);
const result2=await second.json();
assert.equal(result2.role,'provider');
assert.equal(result2.profile.id,'prof-b');
assert.equal(result2.offers[0].id,'offer-b');
assert.ok(queries.filter(x=>x.sql.includes('FROM account_provider_profiles')||x.sql.includes('FROM proposals')).every(x=>x.params[0]==='pro-b'));
assert.ok(queries.every(x=>!x.sql.includes('FROM account_jobs')));
const withoutCookie=new Request('https://oficiord.pages.dev/api/account/dashboard');
assert.equal((await api.onRequestGet({env,request:withoutCookie})).status,401);
for(const method of ['onRequestPost','onRequestPut','onRequestDelete'])assert.equal((await api[method]()).status,503);
console.log('PASS: customer/provider role separation, owner-bound SQL, ignored foreign account IDs, closed writes');
