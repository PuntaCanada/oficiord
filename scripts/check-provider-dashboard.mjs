// Validate the provider journey entirely offline, including browser event handlers.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {providers,regions,categories,jobs,initial,activeProvider,setProvider,toggleArea,matches,listJobs,suggestedQuote,saveOffer,markSimulated,discardOffer,openThread,mockReply} from '../demo/profesional/state.mjs';
const html=await readFile(new URL('../demo/profesional/index.html',import.meta.url),'utf8');
const code=await readFile(new URL('../demo/profesional/app.js',import.meta.url),'utf8');
const account=await readFile(new URL('../account/index.html',import.meta.url),'utf8');
assert.match(html,/name="robots" content="noindex,nofollow,noarchive"/);
assert.match(html,/name="referrer" content="no-referrer"/);
assert.ok(!/<form\b/i.test(html),'No submittable form');
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|navigator\.sendBeacon/.test(code+html));
assert.ok(account.includes('/demo/profesional/?lang='));
assert.ok(account.includes('.provider-teaser[hidden]{display:none}'));
for(const lang of ['es','en','de','fr','ht'])assert.ok(html.includes('data-lang="'+lang+'"'));
for(const id of ['provider','areas','region','category','search','sort','jobs','offers','offer-editor','amount','save-offer','form-error','thread','thread-job','reply-one','reply-two','jobs-empty']){
 assert.ok(html.includes('id="'+id+'"'),id);
}
assert.equal(providers.length,8);
assert.equal(jobs.length,8);
assert.ok(jobs.every(x=>regions.includes(x.region)&&categories.includes(x.category)));
let state=initial();
assert.ok(listJobs(state).length>=2);
assert.ok(listJobs(state).every(x=>activeProvider(state).cats.includes(x.category)&&state.areas.includes(x.region)));
assert.equal(setProvider(state,'not-real'),false);
assert.equal(toggleArea(state,'not-real'),false);
const first=listJobs(state)[0];
assert.ok(suggestedQuote(state,first.id));
assert.equal(saveOffer(state,first.id,499),false);
assert.equal(saveOffer(state,first.id,100001),false);
assert.equal(saveOffer(state,first.id,3500.5),false);
assert.equal(saveOffer(state,'bad',3500),false);
assert.equal(saveOffer(state,first.id,3500),true);
assert.equal(state.offers[first.id].phase,'prepared');
assert.equal(markSimulated(state,first.id),true);
assert.equal(state.offers[first.id].phase,'selected');
assert.equal(discardOffer(state,first.id),true);
assert.equal(markSimulated(state,first.id),false);
assert.equal(openThread(state,'bad'),false);
assert.equal(openThread(state,first.id),true);
assert.equal(mockReply(state,0),true);
assert.equal(mockReply(state,2),false);
state.search='unmatched phrase';assert.equal(listJobs(state).length,0);state.search='';
assert.equal(toggleArea(state,first.region),true);
assert.ok(!listJobs(state).some(x=>x.id===first.id));
assert.equal(suggestedQuote(state,first.id),null);
assert.equal(saveOffer(state,first.id,3500),false);
assert.equal(setProvider(state,providers[1].id),true);
assert.deepEqual(state.areas,providers[1].areas);
assert.equal(Object.keys(state.offers).length,0);
assert.ok(listJobs(state).every(x=>providers[1].cats.includes(x.category)));

// Run actual UI logic in a minimal DOM to catch broken handlers and i18n.
function element(tag='div'){
 return {tag,children:[],dataset:{},attributes:{},className:'',textContent:'',value:'',disabled:false,hidden:false,src:'',
  setAttribute(name,val){this.attributes[name]=val},
  append(...nodes){this.children.push(...nodes)},
  replaceChildren(...nodes){this.children=[...nodes]},
  addEventListener(name,fn){(this.events??={})[name]=fn},
  click(){this.events?.click?.()},
  change(){this.events?.change?.()},
  input(){this.events?.input?.()}
 };
}
const els=new Map(),get=id=>els.get(id)||(els.set(id,element()),els.get(id));
const langBtns=['es','en','de','fr','ht'].map(k=>{let b=element('button');b.dataset.lang=k;return b;});
const document={
 getElementById:get,createElement:element,
 querySelectorAll(selector){assert.equal(selector,'[data-lang]');return langBtns},
 documentElement:{lang:'es'}
};
const strip=code.replace(/^import \{[^\n]+\} from '\.\/state\.mjs';\n/,'');
assert.ok(!strip.startsWith('import'));
vm.runInNewContext(strip,{document,URL,URLSearchParams,history:{replaceState(){}},
 location:{search:'?lang=de',href:'https://oficiord.pages.dev/demo/profesional/?lang=de'},
 Option:class{constructor(label,value){this.textContent=label;this.value=value}},
 providers,regions,categories,jobs,initial,activeProvider,setProvider,toggleArea,matches,listJobs,suggestedQuote,saveOffer,markSimulated,discardOffer,openThread,mockReply
},{timeout:4000});
assert.equal(document.documentElement.lang,'de');
assert.match(get('headline').textContent,/Beispielangebote/);
assert.ok(get('jobs').children.length>=2);
assert.equal(get('job-count').textContent.includes('fiktive Aufträge'),true);
assert.ok(get('areas').children.some(x=>x.attributes['aria-pressed']==='true'));
const displayed=get('jobs').children[0];
const open=displayed.children[1].children.at(-1);
assert.equal(open.textContent,'Beispielangebot vorbereiten');
open.click();
assert.equal(get('offer-editor').hidden,false);
assert.ok(Number(get('amount').value)>0);
get('amount').value='50';
get('save-offer').click();
assert.equal(get('form-error').hidden,false);
get('amount').value='3750';
get('save-offer').click();
assert.equal(get('offer-editor').hidden,true);
assert.equal(get('offers').children.length,1);
get('offers').children[0].children.at(-1).children[0].click();
assert.match(get('offers').children[0].children[0].children[2].textContent,/ausgewählt/);
get('offers').children[0].children.at(-1).children.at(-1).click();
assert.equal(get('offers').children.length,0);
assert.ok(get('thread').children.length>=2);
get('reply-two').click();assert.equal(get('thread').children.length,3);
get('search').value='unmatched';get('search').input();
assert.equal(get('jobs').children.length,0);
assert.equal(get('jobs-empty').hidden,false);
get('search').value='';get('search').input();
get('areas').children.find(x=>x.textContent==='Higüey').click();
assert.ok(get('jobs').children.every(x=>!x.children[1].children[1].textContent.includes('Higüey')));
get('provider').value=providers[1].id;get('provider').change();
assert.equal(get('profile-name').textContent,providers[1].name);
langBtns[1].click();
assert.equal(document.documentElement.lang,'en');
assert.match(get('headline').textContent,/Discover sample jobs/);
assert.match(get('warning').textContent,/Nothing is sent or stored/);
console.log('PASS: provider demo, eight jobs, real matching rules, coverage, filters, quotes, canned messages, 5 locales, no network');
