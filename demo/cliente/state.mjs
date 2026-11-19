// Entirely fictional, ephemeral demo state. No accounts, messages, requests or persistence.
import {exampleQuotes,chooseExampleQuote,validateDraft} from '../crear/engine.mjs';
export const exampleJobs=Object.freeze([
 {id:'demo-job-1',title:{es:'Revisar un aire acondicionado',en:'Inspect an air conditioner',de:'Klimaanlage überprüfen',fr:'Vérifier une climatisation',ht:'Verifye yon èkondisyone'},
  description:{es:'El equipo ficticio no enfría; se necesita revisión de ejemplo.',en:'A fictional unit is not cooling; an example inspection is needed.',de:'Eine fiktive Klimaanlage kühlt nicht richtig und soll überprüft werden.',fr:'Un climatiseur fictif ne refroidit pas ; inspection imaginaire.',ht:'Yon èkondisyone envante pa refwadi; li bezwen yon tès.'},
  region:'Higüey',category:'ac',urgency:'soon'},
 {id:'demo-job-2',title:{es:'Reparación de tubería de ejemplo',en:'Example plumbing repair',de:'Beispielauftrag: Wasserleitung reparieren',fr:'Réparation fictive de canalisation',ht:'Repare tiyo kòm egzanp'},
  description:{es:'Una tubería imaginaria gotea en un apartamento ficticio.',en:'An imaginary pipe is leaking in a fictional apartment.',de:'Eine erfundene Leitung tropft in einer fiktiven Wohnung.',fr:'Une canalisation imaginaire fuit dans un appartement fictif.',ht:'Yon tiyo envante ap koule nan yon apatman envante.'},
  region:'Bávaro',category:'plumbing',urgency:'flexible'}
]);
export const STATUS=['review','quotes','selected'];
export function makeInitialState(){
 return {jobId:exampleJobs[0].id,status:'quotes',selectedQuote:null,compareIds:[],conversationQuote:null,replyIndex:-1};
}
export function findJob(jobId){return exampleJobs.find(j=>j.id===jobId)||null;}
export function jobDraft(job){
 if(!job)return null;
 return {region:job.region,category:job.category,urgency:job.urgency,
 title:job.title.es,description:'Este ejemplo simula una tarea de mantenimiento sin ningún dato personal.'};
}
export function quotesFor(jobId,sort='price'){
 const job=findJob(jobId),draft=jobDraft(job);
 if(!validateDraft(draft))return [];
 return exampleQuotes(draft,sort);
}
export function compatibleQuote(jobId,quoteId){
 const job=findJob(jobId);return job?chooseExampleQuote(jobDraft(job),quoteId):null;
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
