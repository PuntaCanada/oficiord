import { messages } from './i18n.js';
const $ = id => document.getElementById(id);
let secret='';
let lang='de';
const tr=(key,vars={}) => {
 const phrase=messages[lang]?.[key]??messages.de[key]??key;
 return phrase.replace(/\{(\w+)\}/g,(_,k)=>String(vars[k]??''));
};
const statusKeys={
 submissions:['pending','approved','rejected'],
 reports:['pending','reviewed','dismissed'],
 contacts:['pending','handled','rejected']
};
const viewKeys={submissions:'loadSubmissions',reports:'loadReports',contacts:'loadContacts'};
function message(key,vars={}){$('message').textContent=tr(key,vars)}
function rawMessage(value){$('message').textContent=value}
function item(tag,value,className){
 const node=document.createElement(tag);node.textContent=value??'';
 if(className)node.className=className;return node;
}
function appendText(target,tag,value,className){const node=item(tag,value,className);target.append(node);return node}
function renderStatic(){
 document.documentElement.lang=lang;
 document.title=tr('title');
 for(const node of document.querySelectorAll('[data-i18n]'))node.textContent=tr(node.dataset.i18n);
 $('token').placeholder=tr('tokenPlaceholder');
 for(const option of $('view').options)option.textContent=tr(option.value);
 $('locale').value=lang;
 renderStatuses();
}
function renderStatuses(){
 const kind=$('view').value;
 const current=$('filter').value;
 $('filter').replaceChildren();
 for(const key of statusKeys[kind])$('filter').add(new Option(tr(key),key));
 if(statusKeys[kind].includes(current))$('filter').value=current;
 $('load').textContent=tr(viewKeys[kind]);
}
function clearResults(){
 $('results').replaceChildren();
 rawMessage(tr('selectAction',{action:tr(viewKeys[$('view').value])}));
}
function setLanguage(next){
 if(!messages[next])return;
 lang=next;
 renderStatic();
 clearResults();
 // No secrets are stored: only the non-sensitive language preference.
 try{localStorage.setItem('oficiord-admin-language',lang)}catch{}
}
async function call(method,path,body){
 const res=await fetch(path,{method,headers:{authorization:'Bearer '+secret,...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store',credentials:'omit'});
 const data=await res.json().catch(()=>({error:'INVALID_RESPONSE'}));
 if(!res.ok)throw Error(data.error||'REQUEST_FAILED');
 return data;
}
function action(parent,labelKey,onClick,cls=''){
 const button=item('button',tr(labelKey),cls);
 button.type='button';
 button.addEventListener('click',async()=>{
  button.disabled=true;
  try{await onClick()}catch(error){rawMessage(error.message)}
  finally{button.disabled=false}
 });
 parent.append(button);
 return button;
}
function confirmDelete(){return confirm(tr('confirmDelete'))&&prompt(tr('typeDelete'))===tr('deleteWord')}
function formatStatus(key){return tr(key||'deleted')}
function writeCount(view,count,status){
 const names={submissions:'countSubmissions',contacts:'countContacts',reports:'countReports'};
 rawMessage(tr(names[view],{count,status:formatStatus(status)}));
}
function listingRow(itemData,kind){
 const card=item('article','','entry');
 card.append(item('h2',itemData.title));
 card.append(item('small',[itemData.city,itemData.category,itemData.kind,itemData.created_at].filter(Boolean).join(' · ')));
 card.append(item('p',itemData.description));
 const controls=item('div','','actions');
 const status=$('filter').value;
 const decisions=status==='pending'?[['approved','approve'],['rejected','reject']]:status==='approved'?[['rejected','unpublish']]:[];
 for(const [next,label] of decisions){
  action(controls,label,async()=>{
   if(!confirm(tr('confirmAction',{action:tr(label)})))return;
   await call('POST','/api/admin/submissions',{id:itemData.id,status:next});await loadSubmissions();
  },next==='rejected'?'alt':'');
 }
 action(controls,'deleteData',async()=>{
  if(!confirmDelete())return;
  await call('DELETE','/api/admin/submissions',{id:itemData.id,confirm:'DELETE'});await loadSubmissions();
 },'alt');
 card.append(controls);
 return card;
}
function contactRow(data){
 const card=item('article','','entry');
 card.append(item('h2',data.listing_title||tr('deletedListing')));
 card.append(item('small',tr('listingStatus')+': '+(data.listing_status?formatStatus(data.listing_status):tr('deleted'))+' · '+data.created_at));
 card.append(item('p',tr('senderEmail')+': '+data.sender_email));
 card.append(item('p',tr('ownerEmail')+': '+(data.listing_contact_email||tr('unavailable'))));
 card.append(item('p',data.message));
 card.append(item('small',tr('contactRelayNote')));
 const controls=item('div','','actions');
 if($('filter').value==='pending'){
  for(const [next,key] of [['handled','contactHandled'],['rejected','contactReject']]){
   action(controls,key,async()=>{
    if(!confirm(tr('confirmAction',{action:tr(key)})))return;
    await call('POST','/api/admin/contact-requests',{id:data.id,status:next});await loadContacts();
   });
  }
 }
 action(controls,'contactDelete',async()=>{
  if(!confirm(tr('confirmContactDelete'))||prompt(tr('typeDelete'))!==tr('deleteWord'))return;
  await call('DELETE','/api/admin/contact-requests',{id:data.id,confirm:'DELETE'});await loadContacts();
 },'alt');
 card.append(controls);
 return card;
}
function reportRow(data){
 const card=item('article','','entry');
 card.append(item('h2',data.listing_title||tr('deletedListing')));
 card.append(item('small',tr('reportReason')+': '+data.reason+' · '+tr('listing')+': '+(data.listing_status?formatStatus(data.listing_status):tr('deleted'))+' · '+data.created_at));
 card.append(item('p',data.details||tr('noDetails')));
 if($('filter').value==='pending'){
  const controls=item('div','','actions');
  for(const [next,key] of [['reviewed','markReviewed'],['dismissed','dismissReport']]){
   action(controls,key,async()=>{
    if(!confirm(tr('confirmAction',{action:tr(key)})))return;
    await call('POST','/api/admin/reports',{id:data.id,status:next});await loadReports();
   });
  }
  if(data.listing_status==='approved'){
   action(controls,'takedown',async()=>{
    if(!confirm(tr('confirmTakedown')))return;
    await call('POST','/api/admin/submissions',{id:data.submission_id,status:'rejected'});await loadReports();
   },'alt');
  }
  card.append(controls);
 }
 return card;
}
async function list(view,url,row,emptyKey,errorKey){
 $('results').replaceChildren();
 message(view==='contacts'?'loadingContacts':view==='reports'?'loadingReports':'loading');
 const status=$('filter').value;
 if(!statusKeys[view].includes(status)){message('selectStatus');return}
 try{
  const data=await call('GET',url+'?status='+encodeURIComponent(status));
  const entries=data.items||[];
  writeCount(view,entries.length,status);
  if(!entries.length){$('results').append(item('p',tr(emptyKey)));return}
  for(const entry of entries)$('results').append(row(entry));
 }catch(error){message(errorKey,{error:error.message})}
}
const loadSubmissions=()=>list('submissions','/api/admin/submissions',data=>listingRow(data),'emptySubmissions','errorSubmissions');
const loadReports=()=>list('reports','/api/admin/reports',reportRow,'emptyReports','errorReports');
const loadContacts=()=>list('contacts','/api/admin/contact-requests',contactRow,'emptyContacts','errorContacts');
async function load(){
 const input=$('token').value.trim();if(input)secret=input;
 $('token').value='';
 if(!secret){message('enterKey');return}
 const view=$('view').value;
 if(view==='reports')return loadReports();
 if(view==='contacts')return loadContacts();
 return loadSubmissions();
}
$('view').addEventListener('change',()=>{renderStatuses();clearResults()});
$('locale').addEventListener('change',event=>setLanguage(event.target.value));
$('load').addEventListener('click',load);
$('clear').addEventListener('click',()=>{
 secret='';$('token').value='';$('results').replaceChildren();message('sessionClosed')
});
try{const stored=localStorage.getItem('oficiord-admin-language');if(stored&&messages[stored])lang=stored}catch{}
renderStatic();
