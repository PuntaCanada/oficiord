// Pure local authentication checks; no real users, no secrets, no network.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
globalThis.crypto=webcrypto;
const source=await readFile(new URL('../functions/_lib/account-auth.js',import.meta.url),'utf8');
const lib=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const token='a'.repeat(64);
const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
const hash=Buffer.from(digest).toString('hex');
const records={
 good:{id:'customer-a',email:'one@example.invalid',role:'customer',status:'active',email_verified_at:'2026-01-01'},
 provider:{id:'provider-a',email:'two@example.invalid',role:'provider',status:'active',email_verified_at:'2026-01-01'}
};
let session=records.good;
const calls=[];
const DB={prepare(sql){return {bind(...params){calls.push({sql,params});return {async first(){
 if(sql.includes('account_sessions'))return session;
 if(sql.includes('account_jobs'))return params[0]==='job-a'&&params[1]==='customer-a'?{owned:1}:null;
 if(sql.includes('account_provider_profiles'))return params[0]==='profile-a'&&params[1]==='provider-a'?{owned:1}:null;
 return null;
 }}}}}};
const env={ACCOUNTS_ENABLED:'true',DB};
const request=(raw)=>new Request('https://oficiord.pages.dev/api/account/me',{headers:{cookie:raw}});
assert.equal(await lib.readAccountSession({},request('__Host-oficiord_session='+token)),null);
assert.equal(await lib.readAccountSession(env,request('__Host-oficiord_session=wrong')),null);
assert.deepEqual(await lib.readAccountSession(env,request('__Host-oficiord_session='+token)),records.good);
assert.equal(calls[0].params[0],hash);
assert.equal(calls[0].sql.includes('s.expires_at>?'),true);
assert.equal(calls[0].sql.includes('s.revoked_at IS NULL'),true);
assert.equal(calls[0].sql.includes("a.status='active'"),true);
assert.equal(calls[0].sql.includes('a.email_verified_at IS NOT NULL'),true);
assert.equal(lib.isAllowed(records.good,'customer'),true);
assert.equal(lib.isAllowed(records.good,'provider'),false);
assert.equal(await lib.ownsJob(env,records.good,'job-a'),true);
assert.equal(await lib.ownsJob(env,records.good,'other-job'),false);
assert.equal(await lib.ownsJob(env,records.provider,'job-a'),false);
assert.equal(await lib.ownsProfile(env,records.provider,'profile-a'),true);
assert.equal(await lib.ownsProfile(env,records.provider,'other-profile'),false);
assert.equal(await lib.ownsProfile(env,records.good,'profile-a'),false);
const unsafe=new Request('https://oficiord.pages.dev/api/account/me',{method:'POST',headers:{origin:'https://evil.example','sec-fetch-site':'cross-site'}});
const safe=new Request('https://oficiord.pages.dev/api/account/me',{method:'POST',headers:{origin:'https://oficiord.pages.dev','sec-fetch-site':'same-origin'}});
assert.equal(lib.safeMutationRequest(unsafe),false);
assert.equal(lib.safeMutationRequest(safe),true);
assert.equal(lib.safeMutationRequest(new Request('https://oficiord.pages.dev/api/account/me',{method:'POST'})),false);
console.log('PASS: session gating, digests, revocation/expiry filters, role/ownership and CSRF origin');
