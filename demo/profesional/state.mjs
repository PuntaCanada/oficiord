// Provider demo shares a fixed fictional catalog with the customer demo.
import {providers,regions,categories,jobs,quoteFor} from '../shared/catalog.mjs';
export {providers,regions,categories,jobs};
export const validPhases=['draft','prepared','selected'];
export function initial(){
 const p=providers[0];
 return {providerId:p.id,areas:[...p.areas],search:'',region:'',category:'',sort:'newest',selectedJob:null,
 offers:{},threadJob:null,reply:-1};
}
export function activeProvider(state){return providers.find(p=>p.id===state.providerId)||null;}
export function setProvider(state,id){
 const p=providers.find(p=>p.id===id);if(!p)return false;
 Object.assign(state,{providerId:p.id,areas:[...p.areas],search:'',region:'',category:'',sort:'newest',selectedJob:null,offers:{},threadJob:null,reply:-1});
 return true;
}
export function toggleArea(state,area){
 if(!regions.includes(area))return false;
 if(state.areas.includes(area))state.areas=state.areas.filter(a=>a!==area);
 else state.areas=[...state.areas,area];
 return true;
}
export function matches(state,job){
 const provider=activeProvider(state);
 return !!provider&&!!job&&provider.cats.includes(job.category)&&state.areas.includes(job.region);
}
export function listJobs(state){
 let items=jobs.filter(job=>matches(state,job));
 if(state.region)items=items.filter(job=>job.region===state.region);
 if(state.category)items=items.filter(job=>job.category===state.category);
 const term=state.search.trim().toLowerCase();
 if(term)items=items.filter(job=>Object.values(job.title).some(v=>v.toLowerCase().includes(term))||job.region.toLowerCase().includes(term));
 if(state.sort==='region')items.sort((a,b)=>a.region.localeCompare(b.region)||a.id.localeCompare(b.id));
 else if(state.sort==='category')items.sort((a,b)=>a.category.localeCompare(b.category)||a.id.localeCompare(b.id));
 return items;
}
export function suggestedQuote(state,jobId){
 const job=jobs.find(x=>x.id===jobId);
 if(!matches(state,job))return null;
 return quoteFor(job.id,state.providerId);
}
export function saveOffer(state,jobId,amount){
 if(!Number.isSafeInteger(amount)||amount<500||amount>100000||!suggestedQuote(state,jobId))return false;
 state.offers[jobId]={amount,phase:'prepared',providerId:state.providerId};
 return true;
}
export function markSimulated(state,jobId){
 if(!state.offers[jobId]||!suggestedQuote(state,jobId))return false;
 state.offers[jobId]={...state.offers[jobId],phase:'selected'};
 return true;
}
export function discardOffer(state,jobId){
 if(!state.offers[jobId])return false;
 delete state.offers[jobId];return true;
}
export function openThread(state,jobId){
 if(!matches(state,jobs.find(x=>x.id===jobId)))return false;
 state.threadJob=jobId;state.reply=-1;return true;
}
export function mockReply(state,index){
 if(!state.threadJob||!Number.isInteger(index)||index<0||index>1)return false;
 if(!matches(state,jobs.find(x=>x.id===state.threadJob)))return false;
 state.reply=index;return true;
}
