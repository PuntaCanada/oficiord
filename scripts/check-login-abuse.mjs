// Synthetic tests: no network, no email or user data.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const f=async path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const base=await f('functions/_lib/magic-link.js');
const baseURL='data:text/javascript;base64,'+Buffer.from(base).toString('base64');
const abuse=(await f('functions/_lib/login-abuse.js')).replace("'./magic-link.js'","'"+baseURL+"'");
const lib=await import('data:text/javascript;base64,'+Buffer.from(abuse).toString('base64'));
const secret='for-tests-only-not-a-real-secret-'.repeat(3);
const a=await lib.keyedIdentifier(secret,'email','person@example.invalid');
const b=await lib.keyedIdentifier(secret,'email','person@example.invalid');
const ip=await lib.keyedIdentifier(secret,'ip','192.0.2.1');
assert.match(a,/^[0-9a-f]{64}$/);
assert.equal(a,b);
assert.notEqual(a,ip);
assert.equal(a.includes('person'),false);
await assert.rejects(lib.keyedIdentifier('short','ip','192.0.2.1'),/RATE_LIMIT_NOT_CONFIGURED/);
await assert.rejects(lib.keyedIdentifier(secret,'invalid','192.0.2.1'),/INVALID_LIMIT_KEY/);
const counts=new Map();const trace=[];
const DB={prepare(sql){return {bind(...params){trace.push({sql,params});return {async first(){
 const [key,expiry,now,,updatedExpiry,whereNow,limit]=params;
 const old=counts.get(key);
 if(old&&old.expires_at>whereNow&&old.attempts>=limit)return null;
 const row=old&&old.expires_at>now?{attempts:old.attempts+1,expires_at:old.expires_at}:{attempts:1,expires_at:expiry};
 counts.set(key,row);return row;
 }}}}}};
const env={DB,AUTH_RATE_LIMIT_SECRET:secret};
for(let n=0;n<3;n++)assert.equal(await lib.checkFutureLoginQuota(env,' PERSON@Example.invalid ','192.0.2.1',1700000000),true);
assert.equal(await lib.checkFutureLoginQuota(env,'person@example.invalid','192.0.2.1',1700000000),false);
assert.equal(await lib.checkFutureLoginQuota(env,'person@example.invalid','192.0.2.1',1700003600),true);
for(const q of trace){
 assert.equal(q.params.length,7);
 assert.match(q.sql,/ON CONFLICT/);
 assert.match(q.sql,/WHERE account_login_limits\.expires_at<=\?/);
 assert.match(q.sql,/RETURNING attempts,expires_at/);
 assert.equal(q.params.some(x=>x==='person@example.invalid'),false);
}
await assert.rejects(lib.checkFutureLoginQuota({DB},'person@example.invalid','192.0.2.1'),/RATE_LIMIT_NOT_CONFIGURED/);
await assert.rejects(lib.checkFutureLoginQuota(env,'malformed','192.0.2.1'),/INVALID_LIMIT_INPUT/);
const broken={DB:{prepare(){throw new Error('DB_OFFLINE');}},AUTH_RATE_LIMIT_SECRET:secret};
await assert.rejects(lib.checkFutureLoginQuota(broken,'person@example.invalid','192.0.2.1'),/DB_OFFLINE/);
console.log('PASS: HMAC purpose separation, atomic quotas, expiry reset, fail closed, no plaintext identifiers');
