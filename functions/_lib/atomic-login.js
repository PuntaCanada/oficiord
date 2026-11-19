// Future internal-only atomic login transition. No public endpoint invokes this.
// D1 batch() is a transaction: either all statements complete or changes roll back.
// Link hash and session hash are stored, never their plaintext tokens.
import {createOpaqueToken,tokenDigest,SESSION_TTL_SECONDS,sessionCookie,validOpaqueToken} from './magic-link.js';

export async function redeemAndCreateSession(db,linkToken,now=Math.floor(Date.now()/1000)){
 if(!db||typeof db.batch!=='function'||!validOpaqueToken(linkToken)||!Number.isSafeInteger(now)||now<0)return null;
 const linkHash=await tokenDigest(linkToken);
 const sessionToken=createOpaqueToken();
 const sessionHash=await tokenDigest(sessionToken);
 const expiry=now+SESSION_TTL_SECONDS;
 // 1. Acquire unique redemption only for a valid, unused link belonging to an active,
 // email-verified account. Replays cannot insert another redemption row.
 // 2. Issue session only for THIS particular redemption's hash.
 // 3. Mark token used only if this transaction created its associated session.
 // The D1 batch is atomic; UNIQUE violations abort and roll back the batch.
 const statements=[
  db.prepare(
   "INSERT INTO account_login_redemptions(token_hash,session_hash,created_at) "+
   "SELECT t.token_hash,?,? FROM account_login_tokens t JOIN accounts a ON a.id=t.account_id "+
   "WHERE t.token_hash=? AND t.used_at IS NULL AND t.expires_at>? "+
   "AND a.status='active' AND a.email_verified_at IS NOT NULL"
  ).bind(sessionHash,now,linkHash,now),
  db.prepare(
   "INSERT INTO account_sessions(token_hash,account_id,expires_at) "+
   "SELECT ?,t.account_id,? FROM account_login_redemptions r "+
   "JOIN account_login_tokens t ON t.token_hash=r.token_hash "+
   "JOIN accounts a ON a.id=t.account_id "+
   "WHERE r.token_hash=? AND r.session_hash=? AND t.used_at IS NULL AND t.expires_at>? "+
   "AND a.status='active' AND a.email_verified_at IS NOT NULL"
  ).bind(sessionHash,expiry,linkHash,sessionHash,now),
  db.prepare(
   "UPDATE account_login_tokens SET used_at=? WHERE token_hash=? AND used_at IS NULL "+
   "AND EXISTS(SELECT 1 FROM account_login_redemptions r "+
   "JOIN account_sessions s ON s.token_hash=r.session_hash "+
   "WHERE r.token_hash=? AND r.session_hash=? AND s.expires_at>?)"
  ).bind(now,linkHash,linkHash,sessionHash,now)
 ];
 let results;
 try{results=await db.batch(statements);}catch{
  // Never reveal whether an account/link exists and never return a cookie on failure.
  return null;
 }
 if(!Array.isArray(results)||results.length!==3||
    results.some(result=>result?.meta?.changes!==1)){
  // Fail closed: no cookie. If D1 unexpectedly commits partial 0-change results,
  // an administrative cleanup/audit is required before any live rollout.
  return null;
 }
 return {cookie:sessionCookie(sessionToken),expiresAt:expiry};
}
