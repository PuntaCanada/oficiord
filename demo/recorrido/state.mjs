// One-page fictional marketplace walkthrough. Deliberately in-memory only.
import {jobs,providers,matchedProviders,quoteFor,jobById,supportedLanguages} from '../shared/catalog.mjs';
export {jobs,providers,matchedProviders,quoteFor,jobById,supportedLanguages};
export function initialJourney(){
 return {jobId:jobs[0].id,view:'customer',selectedProvider:null,offerStatus:'unprepared',reply:-1};
}
export function setJob(state,id){
 if(!jobById(id))return false;
 state.jobId=id;state.selectedProvider=null;state.offerStatus='unprepared';state.reply=-1;return true;
}
export function setView(state,view){
 if(!['customer','provider'].includes(view))return false;
 state.view=view;return true;
}
export function chooseProvider(state,id){
 if(!quoteFor(state.jobId,id))return false;
 state.selectedProvider=id;state.offerStatus='unprepared';state.reply=-1;return true;
}
export function prepareOffer(state){
 if(!state.selectedProvider||!quoteFor(state.jobId,state.selectedProvider))return false;
 state.offerStatus='prepared';return true;
}
export function confirmOffer(state){
 if(state.offerStatus!=='prepared'||!quoteFor(state.jobId,state.selectedProvider))return false;
 state.offerStatus='selected';return true;
}
export function mockMessage(state,index){
 if(!state.selectedProvider||!quoteFor(state.jobId,state.selectedProvider)||!Number.isInteger(index)||index<0||index>1)return false;
 state.reply=index;return true;
}
export function resetJourney(state){Object.assign(state,initialJourney());return state;}
