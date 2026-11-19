// Offline tests of session lifecycle; not a live login.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base=await readFile(new URL('../functions/_lib/magic-link.js',import.meta.url),'utf8');
const lifecycle=await readFile(new URL('../functions/_lib/session-lifecycle.js',import.meta.url),'utf8');
const baseURL='data:text/javascript;base64,'+Buffer.from(base).toString('base64');
const lifecycleURL='data:text/javascript;base64,'+Buffer.from(lifecycle.replace("'./magic-link.js'","'"+baseURL+"'")).toString('base64');
const {createOpaqueToken,tokenDigest}=await import(baseURL);
const {consumeVerifiedLink,createAccountSession,revokeSession,revokeAllOwnSessions,expiredSessionCookie}=await import(lifecycleURL);
const token=createOpaqueToken(),hash=await tokenDigest(token);
let used=false,revoked=false;
const logs=[];
const db={prepare(sql){return {bind(...params){logs.push({sql,params});return {
 async first(){
  if(sql.includes('UPDATE account_login_tokens')){
   if(params[1]!==hash||used)return null;
   used=true;return {account_id:'customer-test'};
  }
  return null;
 },
 async run(){
  if(sql.includes('INSERT INTO account_sessions'))return {meta:{changes:params[2]==='customer-test'?1:0}};
  if(sql.includes('UPDATE account_sessions')&&sql.includes('account_id=?'))return {meta:{changes:params[1]==='customer-test'?2:0}};
  if(sql.includes('UPDATE account_sessions')){
   if(revoked)return {meta:{changes:0}};
   revoked=true;return {meta:{changes:1}};
  }
  throw new Error('Unexpected statement');
 }
};}}}};
assert.equal(await consumeVerifiedLink(db,'invalid',1700000000),null);
assert.equal(await consumeVerifiedLink(db,token,1700000000),'customer-test');
assert.equal(await consumeVerifiedLink(db,token,1700000000),null,'Replay blocked');
assert.match(logs[0].sql,/used_at IS NULL/);
assert.match(logs[0].sql,/expires_at>/);
assert.match(logs[0].sql,/email_verified_at IS NOT NULL/);
const session=await createAccountSession(db,'customer-test',1700000000);
assert.match(session.cookie,/__Host-oficiord_session=[0-9a-f]{64}/);
assert.match(session.cookie,/HttpOnly; Secure; SameSite=Lax/);
assert.equal(session.expiresAt,1700086400);
assert.equal(logs.some(x=>x.sql.includes('INSERT INTO account_sessions')&&x.params[0].length===64),true);
const raw=session.cookie.match(/session=([0-9a-f]{64})/)[1];
assert.notEqual(logs.find(x=>x.sql.includes('INSERT INTO account_sessions')).params[0],raw);
assert.equal(await revokeSession(db,raw,1700000100),true);
assert.equal(await revokeSession(db,raw,1700000100),false);
assert.equal(await revokeAllOwnSessions(db,{id:'customer-test',status:'active',role:'customer'},1700000200),2);
await assert.rejects(revokeAllOwnSessions(db,{id:'customer-test',status:'suspended',role:'customer'},1700000200),/AUTH_REQUIRED/);
await assert.rejects(revokeAllOwnSessions(db,{id:'customer-test',status:'active',role:'admin'},1700000200),/AUTH_REQUIRED/);
assert.equal(logs.filter(x=>x.sql.includes('account_id=?')&&x.sql.includes('UPDATE account_sessions')).at(-1).params[1],'customer-test');
assert.match(expiredSessionCookie(),/Max-Age=0/);
console.log('PASS: single-use tokens, verified account filter, hashed session, expiry, revocation, logout cookie');
