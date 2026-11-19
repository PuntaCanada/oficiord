// Future account magic-link primitives: DO NOT deploy a working send/consume flow yet.
// These helpers have no network, email or database side effects.
export const TOKEN_TTL_SECONDS=600;
export const SESSION_TTL_SECONDS=86400;
export function createOpaqueToken(){
 const bytes=crypto.getRandomValues(new Uint8Array(32));
 return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
}
export function validOpaqueToken(token){
 return typeof token==='string' && /^[0-9a-f]{64}$/.test(token);
}
export async function tokenDigest(token){
 if(!validOpaqueToken(token))throw new Error('INVALID_TOKEN');
 const bytes=new TextEncoder().encode(token);
 const buffer=await crypto.subtle.digest('SHA-256',bytes);
 return Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,'0')).join('');
}
export function parseAccountEmail(value){
 if(typeof value!=='string'||value.length>254)return null;
 const email=value.trim().toLowerCase();
 if(email.length<5||email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return null;
 return email;
}
export function buildMagicLink(origin,token){
 // Only the first-party HTTPS host is ever allowed as a future link target.
 if(origin!=='https://oficiord.pages.dev'||!validOpaqueToken(token))throw new Error('UNSAFE_LINK');
 return origin+'/account/verify/#token='+token;
}
export function sessionCookie(token){
 if(!validOpaqueToken(token))throw new Error('INVALID_SESSION_TOKEN');
 return '__Host-oficiord_session='+token+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age='+SESSION_TTL_SECONDS;
}
