// Offline contract checks: no real people, no external network, no production writes.
import assert from 'node:assert/strict';
import {onRequestPost as contact} from '../functions/api/contact-requests.js';
import {onRequestGet as config} from '../functions/api/config.js';
import {onRequestGet as adminGet,onRequestPost as adminPost,onRequestDelete as adminDelete} from '../functions/api/admin/contact-requests.js';
import {onRequestPost as submit} from '../functions/api/submissions.js';
let checks=0;
const uuid='a1234567-1234-4234-9234-123456789012';
const adminSecret='test-secret-more-than-thirty-two-characters-123';
const flags={MARKETPLACE_LAUNCH_APPROVED:'true',LEGAL_READINESS_CONFIRMED:'true',SUBMISSIONS_ENABLED:'true',
 CONTACT_REQUESTS_ENABLED:'true',TURNSTILE_SITE_KEY:'test-public-key',TURNSTILE_SECRET:'test-not-production-secret',
 MODERATION_ADMIN_KEY:adminSecret};
const saved=[];
const db={prepare(query){const statement={
 bind(...values){return {...statement,values}},
 async first(){if(query.includes('FROM submissions'))return {id:uuid};return null},
 async run(){if(query.startsWith('INSERT INTO contact_requests'))saved.push(this.values);return {meta:{changes:1}}},
 async all(){return {results:[{id:uuid,listing_title:'Example placeholder',sender_email:'person@example.org',listing_contact_email:'owner@example.org'}]}}
};return statement}};
const env={...flags,DB:db};
const request=(body,headers={})=>new Request('https://oficiord.pages.dev/api/contact-requests',{
 method:'POST',headers:{'content-type':'application/json','origin':'https://oficiord.pages.dev',...headers},body:JSON.stringify(body)});
const valid={submissionId:uuid,senderEmail:'person@example.org',message:'Hola, me interesa conocer los detalles del trabajo.',consent:true,website:'',turnstileToken:'test-validated-token'};
async function expectStatus(promise,status){const response=await promise;assert.equal(response.status,status,JSON.stringify(await response.clone().json()));checks++;return response;}
const cfg=await (await config({env:{...env,LEGAL_READINESS_CONFIRMED:'false'}})).json();
assert.equal(cfg.submissionsEnabled,false);assert.equal(cfg.contactRequestsEnabled,false);checks+=2;
const cfgReady=await (await config({env})).json();
assert.equal(cfgReady.submissionsEnabled,true);assert.equal(cfgReady.contactRequestsEnabled,true);checks+=2;
await expectStatus(contact({env:{...env,CONTACT_REQUESTS_ENABLED:'false'},request:request(valid)}),503);
await expectStatus(contact({env:{...env,LEGAL_READINESS_CONFIRMED:'false'},request:request(valid)}),503);
await expectStatus(contact({env,request:request({...valid,consent:false})}),400);
await expectStatus(contact({env,request:request({...valid,message:'Pay me at somebody@example.com now please'})}),400);
await expectStatus(contact({env,request:request(valid,{'origin':'https://other.invalid'})}),403);
await expectStatus(submit({env:{...env,MARKETPLACE_LAUNCH_APPROVED:'false'},request:request(valid)}),503);
await expectStatus(adminGet({env,request:new Request('https://oficiord.pages.dev/api/admin/contact-requests')}),401);
const adminHeaders={'authorization':'Bearer '+adminSecret};
const privateGet=await expectStatus(adminGet({env,request:new Request('https://oficiord.pages.dev/api/admin/contact-requests?status=pending',{headers:adminHeaders})}),200);
assert.equal((await privateGet.json()).items[0].listing_contact_email,'owner@example.org');checks++;
const old=globalThis.fetch;
globalThis.fetch=async url=>{
 assert.equal(url,'https://challenges.cloudflare.com/turnstile/v0/siteverify');
 return new Response(JSON.stringify({success:true}),{headers:{'content-type':'application/json'}});
};
try{
 const success=await expectStatus(contact({env,request:request(valid)}),202);
 assert.equal((await success.json()).status,'pending');assert.equal(saved.length,1);checks+=2;
}finally{globalThis.fetch=old}
const updateReq=new Request('https://oficiord.pages.dev/api/admin/contact-requests',{method:'POST',headers:{...adminHeaders,'content-type':'application/json','origin':'https://oficiord.pages.dev'},body:JSON.stringify({id:uuid,status:'handled'})});
await expectStatus(adminPost({env,request:updateReq}),200);
const deleteReq=new Request('https://oficiord.pages.dev/api/admin/contact-requests',{method:'DELETE',headers:{...adminHeaders,'content-type':'application/json','origin':'https://oficiord.pages.dev'},body:JSON.stringify({id:uuid,confirm:'DELETE'})});
await expectStatus(adminDelete({env,request:deleteReq}),200);
console.log('PASS: '+checks+' offline feature gates, private contact, anti-spam, moderation and no-account contract checks');
