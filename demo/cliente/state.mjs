// Entirely fictional, ephemeral demo state. No accounts, messages, requests or persistence.
import {jobs,jobById,canonicalDraft,quoteFor} from '../shared/catalog.mjs';
import {exampleQuotes,validateDraft} from '../crear/engine.mjs';
export const exampleJobs=Object.freeze(jobs.slice(0,2));
export const STATUS=['review','quotes','selected'];
export function makeInitialState(){
 return {jobId:exampleJobs[0].id,status:'quotes',selectedQuote:null,compareIds:[],conversationQuote:null,replyIndex:-1};
}
export function findJob(jobId){return exampleJobs.find(j=>j.id===jobId)||null;}
export function jobDraft(job){return canonicalDraft(job);}
export function quotesFor(jobId,sort='price'){
 const job=findJob(jobId),draft=jobDraft(job);
 if(!validateDraft(draft))return [];
 return exampleQuotes(draft,sort);
}
export function compatibleQuote(jobId,quoteId){
 const job=findJob(jobId);return job?quoteFor(job.id,quoteId):null;
}
export function selectQuote(state,quoteId){
 const quote=compatibleQuote(state.jobId,quoteId);
 if(!quote||state.status==='review')return false;
 state.selectedQuote=quote.id;
 state.status='selected';
 state.conversationQuote=quote.id;
 state.replyIndex=-1;
 return true;
}
export function chooseJob(state,id){
 if(!findJob(id))return false;
 state.jobId=id;state.status='quotes';state.selectedQuote=null;state.compareIds=[];
 state.conversationQuote=null;state.replyIndex=-1;
 return true;
}
export function compareToggle(state,id){
 if(!compatibleQuote(state.jobId,id))return false;
 if(state.compareIds.includes(id))state.compareIds=state.compareIds.filter(x=>x!==id);
 else if(state.compareIds.length<3)state.compareIds=[...state.compareIds,id];
 return true;
}
export function openConversation(state,quoteId){
 if(!compatibleQuote(state.jobId,quoteId))return false;
 state.conversationQuote=quoteId;state.replyIndex=-1;return true;
}
export function simulateReply(state,index){
 if(!state.conversationQuote||!compatibleQuote(state.jobId,state.conversationQuote)||!Number.isInteger(index)||index<0||index>1)return false;
 state.replyIndex=index;return true;
}
export function resetJob(state){
 const fresh=makeInitialState();Object.assign(state,fresh);return state;
}
