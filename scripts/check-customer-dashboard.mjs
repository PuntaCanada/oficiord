// Fully offline simulated dashboard tests: no real accounts, API calls or storage.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {exampleJobs,makeInitialState,findJob,quotesFor,compatibleQuote,chooseJob,selectQuote,compareToggle,openConversation,simulateReply,resetJob} from '../demo/cliente/state.mjs';
const html=await readFile(new URL('../demo/cliente/index.html',import.meta.url),'utf8');
const js=await readFile(new URL('../demo/cliente/app.js',import.meta.url),'utf8');
const account=await readFile(new URL('../account/index.html',import.meta.url),'utf8');
assert.match(html,/name="robots" content="noindex,nofollow,noarchive"/);
assert.match(html,/name="referrer" content="no-referrer"/);
assert.ok(!/<form\b/i.test(html));
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|navigator\.sendBeacon/.test(js+html));
assert.ok(account.includes('/demo/cliente/'));
assert.ok(account.includes('customer-demo-teaser'));
assert.ok(account.includes('.customer-teaser[hidden]{display:none}'));
for(const lang of ['es','en','de','fr','ht'])assert.ok(html.includes('data-lang="'+lang+'"'),'flag '+lang);
for(const id of ['job-one','job-two','status-review','status-quotes','status-selected','quote-list','comparison-list','conversation','message-list','reply-a','reply-b','reset']){
 assert.ok(html.includes('id="'+id+'"'),'Missing '+id);
}
let state=makeInitialState();
assert.equal(state.jobId,exampleJobs[0].id);
assert.equal(state.status,'quotes');
const first=quotesFor(state.jobId);
assert.ok(first.length>=3);
assert.ok(first.every(x=>x.areas.includes('Higüey')&&x.cats.includes('ac')));
assert.ok(first.every((x,i)=>!i||first[i-1].amount<=x.amount));
assert.ok(quotesFor(state.jobId,'time').every((x,i,a)=>!i||a[i-1].days<=x.days));
assert.equal(chooseJob(state,'malicious'),false);
assert.equal(selectQuote(state,'unknown'),false);
for(const q of first.slice(0,3))assert.equal(compareToggle(state,q.id),true);
assert.equal(state.compareIds.length,3);
assert.equal(compareToggle(state,first[0].id),true);
assert.equal(state.compareIds.length,2);
assert.equal(compareToggle(state,first[0].id),true);
assert.equal(state.compareIds.length,3);
assert.equal(compareToggle(state,'malicious'),false);
assert.equal(selectQuote(state,first[1].id),true);
assert.equal(state.status,'selected');
assert.equal(state.selectedQuote,first[1].id);
assert.equal(openConversation(state,first[0].id),true);
assert.equal(simulateReply(state,1),true);
assert.equal(simulateReply(state,9),false);
assert.equal(chooseJob(state,exampleJobs[1].id),true);
assert.equal(state.selectedQuote,null);
assert.equal(state.compareIds.length,0);
assert.equal(state.replyIndex,-1);
assert.equal(state.status,'quotes');
assert.equal(compatibleQuote(state.jobId,first[0].id),null);
assert.ok(quotesFor(state.jobId).every(x=>x.cats.includes('plumbing')&&x.areas.includes('Bávaro')));
resetJob(state);
assert.equal(state.jobId,exampleJobs[0].id);
assert.equal(state.selectedQuote,null);
assert.equal(findJob('bad'),null);

// Exercise the actual browser script's DOM interactions.
const elements=new Map();
const node=(tag='div')=>({
 tag,dataset:{},attributes:{},children:[],value:'',textContent:'',hidden:false,disabled:false,src:'',
 className:'',scrollIntoView(){},
 setAttribute(k,v){this.attributes[k]=v;},
 append(...x){this.children.push(...x);},
 replaceChildren(...x){this.children=[...x];},
 addEventListener(k,fn){(this.events??={})[k]=fn;},
 click(){this.events?.click?.();},
 change(){this.events?.change?.();}
});
const get=id=>elements.get(id)||(elements.set(id,node()),elements.get(id));
const buttons=['es','en','de','fr','ht'].map(lang=>{const b=node('button');b.dataset.lang=lang;return b;});
const dom={getElementById:get,createElement:node,querySelectorAll(s){assert.equal(s,'[data-lang]');return buttons},documentElement:{lang:'es'}};
const app=js.replace(/^import \{[^\n]+\} from '\.\/state\.mjs';\n/,'');
assert.ok(!app.startsWith('import'),'Module import was not stripped');
vm.runInNewContext(app,{
 document:dom,URL,URLSearchParams,history:{replaceState(){}},
 location:{search:'?lang=de',href:'https://oficiord.pages.dev/demo/cliente/?lang=de'},
 Option:class{constructor(text,value){this.textContent=text;this.value=value}},
 exampleJobs,makeInitialState,findJob,quotesFor,compatibleQuote,chooseJob,selectQuote,compareToggle,openConversation,simulateReply,resetJob
},{timeout:3500});
assert.equal(dom.documentElement.lang,'de');
assert.match(get('headline').textContent,/Aufträge im Blick/);
assert.equal(get('quote-list').children.length,first.length);
assert.match(get('warning').textContent,/Nichts wird versendet/);
assert.equal(get('status-quotes').dataset.active,'true');
assert.equal(get('conversation').children.length,first.length);
assert.equal(get('message-list').children.length,2);
get('reply-a').click();assert.equal(get('message-list').children.length,3);
get('quote-list').children[0].children.at(-1).children[0].click();
assert.equal(get('comparison-list').children.length,1);
get('quote-list').children[0].children.at(-1).children[1].click();
assert.equal(get('status-selected').dataset.active,'true');
assert.equal(get('selected-note').hidden,false);
get('job-two').click();
assert.equal(get('job-title').textContent,exampleJobs[1].title.de);
assert.equal(get('status-quotes').dataset.active,'true');
assert.equal(get('comparison-list').children.length,0);
assert.equal(get('message-list').children.length,2);
buttons[1].click();
assert.equal(dom.documentElement.lang,'en');
assert.match(get('headline').textContent,/Track jobs/);
get('reset').click();assert.equal(get('status-quotes').dataset.active,'true');
assert.equal(get('comparison-list').children.length,0);
assert.equal(get('job-title').textContent,exampleJobs[0].title.en);
console.log('PASS: 5-language customer preview, own sample jobs, status changes, quote sorting/selection, compare max 3, canned messages, no writes');
