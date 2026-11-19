/**
 * Offline PRE-LAUNCH reference policy, never imported by production API routes.
 * This is NOT a deployed review or reporting endpoint. All identity, proof,
 * idempotency and anti-spam decisions must be checked server-side at launch.
 */
export const REVIEW_POLICY=Object.freeze({
 maxTitle:80,maxBody:1200,minBody:20,allowedStars:[1,2,3,4,5],
 statuses:['pending','approved','rejected','removed'],
 forbiddenClaims:['verified','verificado','verifiziert','vérifié','verifye']
});
export function normalizeReviewCandidate(input){
 if(!input||typeof input!=='object'||Array.isArray(input))return null;
 const allowed=['jobId','providerId','stars','title','body','consent'];
 if(Object.keys(input).some(k=>!allowed.includes(k)))return null;
 if(typeof input.jobId!=='string'||!/^[a-zA-Z0-9_-]{8,64}$/.test(input.jobId))return null;
 if(typeof input.providerId!=='string'||!/^[a-zA-Z0-9_-]{8,64}$/.test(input.providerId))return null;
 if(!Number.isInteger(input.stars)||!REVIEW_POLICY.allowedStars.includes(input.stars))return null;
 if(typeof input.title!=='string'||typeof input.body!=='string')return null;
 const title=input.title.trim(),body=input.body.trim();
 if(!title||title.length>REVIEW_POLICY.maxTitle||body.length<REVIEW_POLICY.minBody||body.length>REVIEW_POLICY.maxBody)return null;
 if(input.consent!==true)return null;
 if(/[<>\u0000-\u001f\u007f]/u.test(title+body))return null;
 // Only normalized fields; contact details and arbitrary identifiers are not kept.
 return {jobId:input.jobId,providerId:input.providerId,stars:input.stars,title,body};
}
export function eligibilityRequirements(){
 return Object.freeze([
  'verified customer identity and server-side authenticated session',
  'closed/completed job with confirmed provider assignment',
  'unique review per completed customer–job–provider relationship',
  'fraud and coercion checks, dispute and appeal process',
  'atomic rate limiting and independent moderator approval'
 ]);
}
export function reviewShownAsVerified({completed,customerIsOwner,providerAssigned,moderatorApproved,notRemoved}={}){
 // Conjunctive check is a design safeguard, not a production implementation.
 return [completed,customerIsOwner,providerAssigned,moderatorApproved,notRemoved].every(x=>x===true);
}
export function safePublicReview({moderatorApproved,eligible,redacted,privacyChecked}={}){
 return [moderatorApproved,eligible,redacted,privacyChecked].every(x=>x===true);
}
