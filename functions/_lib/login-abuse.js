// Future passwordless login abuse protection. Internal only; no public request endpoint.
// Requires D1 migration 0005 and AUTH_RATE_LIMIT_SECRET generated privately.
// Do not enable public login until end-to-end email and ownership testing is complete.
import {parseAccountEmail} from './magic-link.js';

export const WINDOW_SECONDS=3600;
export const MAX_EMAIL_REQUESTS=3;
export const MAX_IP_REQUESTS=10;
const VALID_HEX=/^[a-f0-9]{64}$/;

export async function keyedIdentifier(secret,purpose,value){
 if(typeof secret!=='string'||secret.length<32)throw new Error('RATE_LIMIT_NOT_CONFIGURED');
 if(!['email','ip'].includes(purpose)||typeof value!=='string'||!value||value.length>254)throw new Error('INVALID_LIMIT_KEY');
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const digest=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode('oficiord:login:'+purpose+':'+value));
 return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}

// UPDATE is atomic in SQLite/D1, avoids read-then-write races.
// Resets an expired window, increments under the limit, and returns nothing if throttled.
// A DB error must propagate (fail closed), never become an allowed request.
export async function consumeQuota(db,keyHash,maxRequests,now=Math.floor(Date.now()/1000)){
 if(typeof keyHash!=='string'||!VALID_HEX.test(keyHash)||!Number.isInteger(maxRequests)||maxRequests<1||maxRequests>100||
 !Number.isSafeInteger(now)||now<0)throw new Error('INVALID_LIMIT_INPUT');
 const expiry=now+WINDOW_SECONDS;
 const row=await db.prepare(
  'INSERT INTO account_login_limits(key_hash,attempts,expires_at) VALUES(?,1,?) '+
  'ON CONFLICT(key_hash) DO UPDATE SET '+
  'attempts=CASE WHEN expires_at<=? THEN 1 ELSE attempts+1 END, '+
  'expires_at=CASE WHEN expires_at<=? THEN ? ELSE expires_at END '+
  'WHERE account_login_limits.expires_at<=? OR account_login_limits.attempts<? '+
  'RETURNING attempts,expires_at'
 ).bind(keyHash,expiry,now,now,expiry,now,maxRequests).first();
 return Boolean(row&&row.attempts>=1&&row.attempts<=maxRequests);
}

// Both keys are charged. Requests must be allowed only when *both* are within budget.
// This is not a substitute for edge/WAF limits, Turnstile and anti-enumeration.
export async function checkFutureLoginQuota(env,email,ip,now=Math.floor(Date.now()/1000)){
 if(!env?.DB)throw new Error('RATE_LIMIT_NOT_CONFIGURED');
 const normalized=parseAccountEmail(email);
 if(!normalized||typeof ip!=='string'||ip.length<3||ip.length>128)throw new Error('INVALID_LIMIT_INPUT');
 const secret=env.AUTH_RATE_LIMIT_SECRET;
 const emailKey=await keyedIdentifier(secret,'email',normalized);
 const ipKey=await keyedIdentifier(secret,'ip',ip);
 // Sequential checks are intentional. No promise race between DB writes.
 const ipAllowed=await consumeQuota(env.DB,ipKey,MAX_IP_REQUESTS,now);
 const emailAllowed=await consumeQuota(env.DB,emailKey,MAX_EMAIL_REQUESTS,now);
 return ipAllowed&&emailAllowed;
}
