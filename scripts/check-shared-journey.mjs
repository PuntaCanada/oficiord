// Shared, strictly fictional journey: catalog parity, status transitions, DOM, security.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {jobs,providers,matchedProviders,quoteFor,jobById,supportedLanguages,initialJourney,setJob,setView,chooseProvider,prepareOffer,confirmOffer,mockMessage,resetJourney} from '../demo/recorrido/state.mjs';
import {exampleJobs,quotesFor,compatibleQuote} from '../demo/cliente/state.mjs';
import {jobs as providerJobs,initial as providerInitial,listJobs,suggestedQuote} from '../demo/profesional/state.mjs';
const html=await readFile(new URL('../demo/recorrido/index.html',import.meta.url),'utf8');
const app=await readFile(new URL('../demo/recorrido/app.js',import.meta.url),'utf8');
const customer=await readFile(new URL('../demo/cliente/index.html',import.meta.url),'utf8');
const provider=await readFile(new URL('../demo/profesional/index.html',import.meta.url),'utf8');
assert.match(html,/name="robots" content="noindex,nofollow,noarchive"/);
assert.match(html,/name="referrer" content="no-referrer"/);
assert.ok(!/<form\b/i.test(html));
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|navigator\.sendBeacon/.test(app+html));
assert.ok(customer.includes('/demo/recorrido/'));
assert.ok(provider.includes('/demo/recorrido/'));
assert.equal(jobs.length,8);
assert.equal(providerJobs,jobs,'Both perspectives must use exact same catalog array');
assert.equal(exampleJobs[0],jobs[0]);
assert.equal(exampleJobs[1],jobs[1]);
assert.equal(new Set(jobs.map(j=>j.id)).size,jobs.length);
for(const job of jobs){
 assert.equal(jobById(job.id),job);
 for(const lang of supportedLanguages){
  assert.ok(job.title[lang]?.trim(),'Title '+job.id+' '+lang);
  assert.ok(job.description[lang]?.trim(),'Description '+job.id+' '+lang);
 }
 for(const p of providers){
  const expected=p.cats.includes(job.category)&&p.areas.includes(job.region);
  assert.equal(!!quoteFor(job.id,p.id),expected);
  assert.equal(matchedProviders(job.id).some(x=>x.id===p.id),expected);
 }
}
for(const job of exampleJobs){
 const consumer=quotesFor(job.id);
 assert.equal(consumer.length,matchedProviders(job.id).length);
 for(const q of consumer){
  const canonical=quoteFor(job.id,q.id);
  assert.equal(canonical.amount,q.amount);
  assert.equal(canonical.days,q.days);
  assert.equal(compatibleQuote(job.id,q.id).amount,q.amount);
 }
}
const state=initialJourney();
assert.equal(prepareOffer(state),false);
assert.equal(confirmOffer(state),false);
assert.equal(chooseProvider(state,'untrusted'),false);
assert.equal(setJob(state,'unknown'),false);
assert.equal(mockMessage(state,0),false);
const match=matchedProviders(state.jobId)[0];
assert.ok(match);
assert.equal(chooseProvider(state,match.id),true);
assert.equal(prepareOffer(state),true);
assert.equal(state.offerStatus,'prepared');
assert.equal(confirmOffer(state),true);
assert.equal(state.offerStatus,'selected');
assert.equal(mockMessage(state,0),true);
assert.equal(mockMessage(state,2),false);
assert.equal(setView(state,'invalid'),false);
assert.equal(setView(state,'provider'),true);
const another=jobs[1].id;
assert.equal(setJob(state,another),true);
assert.equal(state.selectedProvider,null);
assert.equal(state.reply,-1);
assert.equal(state.offerStatus,'unprepared');
resetJourney(state);assert.equal(state.jobId,jobs[0].id);

// DOM-shaped test executes the real 5-language client JavaScript handlers.
const nodes=new Map();
function element(tag='div'){
 return {tag,dataset:{},attributes:{},children:[],value:'',textContent:'',disabled:false,hidden:false,src:'',
  setAttribute(k,v){this.attributes[k]=v;},append(...n){this.children.push(...n);},
  replaceChildren(...n){this.children=[...n];},addEventListener(type,fn){(this.events??={})[type]=fn;},
  click(){if(!this.disabled)this.events?.click?.();},change(){this.events?.change?.();}
 };
}
const $=id=>nodes.get(id)||(nodes.set(id,element()),nodes.get(id));
const languages=supportedLanguages.map(lang=>{const el=element('button');el.dataset.lang=lang;return el;});
const document={getElementById:$,createElement:element,querySelectorAll(s){assert.equal(s,'[data-lang]');return languages},documentElement:{lang:'es'}};
const stripped=app.replace(/^import \{[^\n]+\} from '\.\/state\.mjs';\n/,'');
assert.ok(!stripped.startsWith('import'));
vm.runInNewContext(stripped,{document,history:{replaceState(){}},URL,URLSearchParams,
 location:{search:'?lang=de',href:'https://oficiord.pages.dev/demo/recorrido/?lang=de'},
 Option:class{constructor(name,value){this.textContent=name;this.value=value}},
 jobs,providers,matchedProviders,quoteFor,jobById,supportedLanguages,initialJourney,setJob,setView,chooseProvider,prepareOffer,confirmOffer,mockMessage,resetJourney
},{timeout:4000});
assert.equal(document.documentElement.lang,'de');
assert.match($('heading').textContent,/Kunden- und Handwerkersicht/);
assert.equal($('offers').children.length,matchedProviders(jobs[0].id).length);
assert.equal($('prepare').disabled,true);
$('offers').children[0].children.at(-1).click();
assert.equal($('prepare').disabled,true,'Preparation is restricted to provider perspective');
$('view-provider').click();
assert.equal($('prepare').disabled,false);
$('prepare').click();
assert.equal($('phase-prepared').dataset.current,'true');
assert.equal($('confirm').disabled,true,'Provider cannot simulate customer choice');
$('view-customer').click();
assert.equal($('confirm').disabled,false);
$('confirm').click();
assert.equal($('phase-selected').dataset.current,'true');
assert.equal($('choice-note').hidden,false);
$('reply-two').click();
assert.equal($('thread').children.length,3);
$('view-provider').click();
assert.equal($('thread').children.length,3);
$('job').value=jobs[1].id;$('job').change();
assert.equal($('phase-open').dataset.current,'true');
assert.equal($('thread').children.length,1);
languages.find(x=>x.dataset.lang==='en').click();
assert.equal(document.documentElement.lang,'en');
assert.match($('heading').textContent,/One fictional job/);
$('reset').click();assert.equal($('phase-open').dataset.current,'true');
assert.equal($('job-title').textContent,jobs[0].title.en);
console.log('PASS: canonical job/quote consistency, 5-language shared journey, state transitions, provider and customer isolation, no network/storage');
