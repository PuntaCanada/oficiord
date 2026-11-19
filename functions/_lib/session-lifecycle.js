// Internal, not exposed as public login. Future passwordless account lifecycle.
// No email sending or account creation is performed by these helpers.
import {createOpaqueToken,tokenDigest,SESSION_TTL_SECONDS,sessionCookie,validOpaqueToken} from './magic-link.js';
const nowSeconds=()=>Math.floor(Date.now()/1000);

// Atomic conditional UPDATE ensures only one parallel request can consume a link.
// Never place raw login tokens in database rows, query strings, logs or error replies.
// Requires SQLite/D1 support for UPDATE ... RETURNING.
export async function consumeVerifiedLink(db,token,now=nowSeconds()){
 if(!validOpaqueToken(token)||!Number.isSafeInteger(now)||now<0)return null;
 const digest=await tokenDigest(token);
 const row=await db.prepare(
  "UPDATE account_login_tokens SET used_at=? WHERE token_hash=? AND used_at IS NULL AND expires_at>? AND EXISTS (SELECT 1 FROM accounts a WHERE a.id=account_login_tokens.account_id AND a.status='active' AND a.email_verified_at IS NOT NULL) RETURNING account_id"
 ).bind(now,digest,now).first();
 return row?.account_id||null;
}

// Session creation must only be called AFTER authenticated link consumption.
// Raw token only returned to the caller for HttpOnly Set-Cookie; only hash goes to D1.
export async function createAccountSession(db,accountId,now=nowSeconds()){
 if(typeof accountId!=='string'||accountId.length<1||accountId.length>128||!Number.isSafeInteger(now)||now<0)throw new Error('INVALID_SESSION_INPUT');
 const raw=createOpaqueToken();
 const digest=await tokenDigest(raw);
 const expiry=now+SESSION_TTL_SECONDS;
 const result=await db.prepare(
  "INSERT INTO account_sessions(token_hash,account_id,expires_at) SELECT ?,id,? FROM accounts WHERE id=? AND status='active' AND email_verified_at IS NOT NULL"
 ).bind(digest,expiry,accountId).run();
 if(result.meta?.changes!==1)throw new Error('SESSION_NOT_CREATED');
 return {cookie:sessionCookie(raw),expiresAt:expiry};
}

export async function revokeSession(db,rawToken,now=nowSeconds()){
 if(!validOpaqueToken(rawToken))return false;
 const digest=await tokenDigest(rawToken);
 const result=await db.prepare(
  "UPDATE account_sessions SET revoked_at=? WHERE token_hash=? AND revoked_at IS NULL"
 ).bind(now,digest).run();
 return result.meta?.changes===1;
}

// Call only from authenticated account context, never from client-supplied account ID.
// Future "log out on all devices" helper. No live public endpoint.
export async function revokeAllOwnSessions(db,verifiedAccount,now=nowSeconds()){
 if(!verifiedAccount||verifiedAccount.status!=='active'||
 !['customer','provider'].includes(verifiedAccount.role)||
 typeof verifiedAccount.id!=='string'||verifiedAccount.id.length<1||
 !Number.isSafeInteger(now)||now<0)throw new Error('AUTH_REQUIRED');
 const result=await db.prepare(
  'UPDATE account_sessions SET revoked_at=? WHERE account_id=? AND revoked_at IS NULL'
 ).bind(now,verifiedAccount.id).run();
 return result.meta?.changes||0;
}

export function expiredSessionCookie(){
 return '__Host-oficiord_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}
