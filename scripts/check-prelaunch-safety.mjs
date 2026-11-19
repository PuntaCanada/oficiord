import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizeReviewCandidate,eligibilityRequirements,reviewShownAsVerified,safePublicReview} from './prelaunch-review-policy.mjs';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const sample={jobId:'job_demo_001',providerId:'provider_01',stars:4,title:'Example feedback',body:'This is only fictional preview feedback.',consent:true};
assert.deepEqual(normalizeReviewCandidate(sample),{jobId:sample.jobId,providerId:sample.providerId,stars:4,title:sample.title,body:sample.body});
for(const invalid of [
 {...sample,stars:0},{...sample,stars:6},{...sample,stars:4.2},
 {...sample,consent:false},{...sample,jobId:'<script>'},
 {...sample,body:'x'},{...sample,body:'x'.repeat(1201)},
 {...sample,title:'<b>Fake</b>'},{...sample,contactEmail:'hidden@example.invalid'},
 {...sample,providerId:'not valid id'},null,['x']
])assert.equal(normalizeReviewCandidate(invalid),null);
assert.ok(eligibilityRequirements().length>=5);
const conditions={completed:true,customerIsOwner:true,providerAssigned:true,moderatorApproved:true,notRemoved:true};
assert.equal(reviewShownAsVerified(conditions),true);
for(const key of Object.keys(conditions))assert.equal(reviewShownAsVerified({...conditions,[key]:false}),false);
assert.equal(reviewShownAsVerified({}),false);
const publish={moderatorApproved:true,eligible:true,redacted:true,privacyChecked:true};
assert.equal(safePublicReview(publish),true);
for(const key of Object.keys(publish))assert.equal(safePublicReview({...publish,[key]:false}),false);
// Neither demo nor production needs the review policy module at runtime.
const dirs=['demo/recorrido','demo/cliente','demo/profesional','demo/crear','account'];
for(const dir of dirs){
 const html=await read(dir+'/index.html');
 assert.match(html,/<a class="skip-to-content" href="#main-content">/,'Missing skip link: '+dir);
 assert.match(html,/<main id="main-content"/,'Missing main target: '+dir);
 assert.match(html,/@media\(prefers-contrast:more\)/,'Missing high-contrast fallback: '+dir);
 assert.match(html,/<meta name="robots" content="noindex,nofollow,noarchive"/);
 assert.ok(!/<form[^>]+action=/i.test(html));
}
const joint=await read('demo/recorrido/index.html');
const jointApp=await read('demo/recorrido/app.js');
for(const id of ['trust-title','trust-badge','trust-description'])assert.ok(joint.includes('id="'+id+'"'));
for(const key of ['es','en','de','fr','ht'])assert.ok(jointApp.includes(key+':')||jointApp.includes('"'+key+'":'));
assert.ok(!/rating\s*:\s*[1-5]|reviewCount\s*:\s*\d|fakeReviews|verified\s*:\s*true/.test(jointApp));
const headers=await read('_headers');
assert.match(headers,/\/demo\/\*\n  Cache-Control: no-store\n  Referrer-Policy: no-referrer\n  X-Robots-Tag: noindex, nofollow, noarchive/);
assert.match(headers,/\/account\/\*\n  Cache-Control: no-store/);
assert.match(headers,/X-Frame-Options: DENY/);
assert.match(headers,/X-Content-Type-Options: nosniff/);
const docs=await read('SAFE_LAUNCH_READINESS.md');
assert.ok(docs.includes('NOT authorization to launch'));
assert.ok(docs.includes('One verified relationship, one review'));
assert.ok(docs.includes('without a separate user authorization'));
const gateFiles={
 'functions/api/account/login.js':/LOGIN_NOT_ENABLED/,
 'functions/api/submissions.js':/env\.SUBMISSIONS_ENABLED!=='true'/,
 'functions/api/reports.js':/env\.REPORTS_ENABLED!=='true'/
};
for(const [path,pattern] of Object.entries(gateFiles))assert.match(await read(path),pattern,path+' gate missing');
for(const dir of ['demo/recorrido','demo/cliente','demo/profesional','demo/crear']){
 const js=await read(dir+'/app.js');
 assert.doesNotMatch(js,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage/);
 assert.doesNotMatch(js,/prelaunch-review-policy/);
}
console.log('PASS: review anti-fraud policy, no fake reviews, 5 demo a11y targets, scoped headers and closed production gates');
