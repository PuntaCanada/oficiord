// Internal auth helpers. No public token issuance is implemented.
const COOKIE='__Host-oficiord_session';
// Opaque random 32-byte session token encoded as 64 hexadecimal digits.
// Only the SHA-256 digest is stored in D1; raw session tokens must never enter logs or URLs.
export async function readAccountSession(env,request){
 if(env.ACCOUNTS_ENABLED!=='true'||!env.DB)return null;
 const cookie=request.headers.get('cookie')||'';
 const pairs=cookie.split(';');
 const value=pairs.map(p=>p.trim()).find(p=>p.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
 if(!value||!(/^[0-9a-f]{64}$/i).test(value))return null;
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
 const hash=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
 const now=Math.floor(Date.now()/1000);
 const account=await env.DB.prepare(
  "SELECT a.id,a.email,a.role,a.status,a.email_verified_at FROM account_sessions s JOIN accounts a ON s.account_id=a.id WHERE s.token_hash=? AND s.expires_at>? AND s.revoked_at IS NULL AND a.status='active' AND a.email_verified_at IS NOT NULL LIMIT 1"
 ).bind(hash,now).first();
 return account||null;
}
export function isAllowed(account,role){
 return Boolean(account&&account.status==='active'&&account.role===role);
}
export async function ownsJob(env,account,jobId){
 if(!isAllowed(account,'customer'))return false;
 const owned=await env.DB.prepare('SELECT 1 AS owned FROM account_jobs WHERE submission_id=? AND account_id=? LIMIT 1').bind(jobId,account.id).first();
 return owned?.owned===1;
}
export async function ownsProfile(env,account,profileId){
 if(!isAllowed(account,'provider'))return false;
 const owned=await env.DB.prepare('SELECT 1 AS owned FROM account_provider_profiles WHERE profile_id=? AND account_id=? LIMIT 1').bind(profileId,account.id).first();
 return owned?.owned===1;
}
export function safeMutationRequest(request){
 const origin=request.headers.get('origin');
 const site=request.headers.get('sec-fetch-site');
 if(origin!==new URL(request.url).origin)return false; // exact-origin check
 if(site&&site!=='same-origin')return false;
 return true; // cookies must additionally be SameSite=Lax/Strict + Secure + HttpOnly
}
