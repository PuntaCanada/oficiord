// Strictly offline tests for the fictional OficioRD customer flow.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {regions,categories,providers,validateDraft,exampleQuotes,chooseExampleQuote} from '../demo/crear/engine.mjs';
const html=await readFile(new URL('../demo/crear/index.html',import.meta.url),'utf8');
const app=await readFile(new URL('../demo/crear/app.js',import.meta.url),'utf8');
const main=await readFile(new URL('../demo/index.html',import.meta.url),'utf8');
assert.ok(html.includes('name="robots" content="noindex,nofollow,noarchive"'));
for(const id of ['draft-category','draft-region','draft-title','draft-description','draft-urgency','draft-next','sort','quote-list','quote-empty','choice-provider','choice-job-title','reset-demo','back-edit','back-compare']){
 assert.ok(html.includes('id="'+id+'"'),'Missing UI field '+id);
}
for(const lang of ['es','en','de','fr','ht'])assert.ok(html.includes('data-lang="'+lang+'"'));
assert.ok(main.includes('/demo/crear/'),'Entry point not linked from marketplace');
assert.ok(!/<form\b/i.test(html),'No form may submit unexpectedly');
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|navigator\.sendBeacon/.test(app+html));
assert.ok(providers.every(p=>p.cats.every(x=>categories.includes(x))&&p.areas.every(x=>regions.includes(x))));
assert.ok(providers.every(p=>p.name.includes('ejemplo')));
const draft={region:'Higüey',category:'ac',title:'Revisión ficticia de equipo',description:'El equipo de ejemplo no enfría, inspección ficticia necesaria.',urgency:'flexible'};
assert.equal(validateDraft(draft),true);
const quotes=exampleQuotes(draft);
assert.ok(quotes.length>=3,'Default wizard should compare at least 3 imaginary quotes');
assert.ok(quotes.every(q=>q.illustrative&&q.cats.includes('ac')&&q.areas.includes('Higüey')));
assert.ok(quotes.every(q=>Number.isInteger(q.amount)&&q.amount>0&&Number.isInteger(q.days)&&q.days>0));
assert.ok(quotes.every((q,i)=>!i||quotes[i-1].amount<=q.amount));
const faster=exampleQuotes(draft,'time');assert.ok(faster.every((q,i)=>!i||faster[i-1].days<=q.days));
const descending=exampleQuotes(draft,'high');assert.ok(descending.every((q,i)=>!i||descending[i-1].amount>=q.amount));
const picked=chooseExampleQuote(draft,quotes[0].id);assert.equal(picked.id,quotes[0].id);
assert.equal(chooseExampleQuote(draft,'not-real'),null);
assert.deepEqual(exampleQuotes({...draft,category:'invalid'}),[]);
assert.equal(validateDraft({...draft,title:'a'}),false);
assert.equal(validateDraft({...draft,description:'tiny'}),false);
assert.equal(validateDraft({...draft,region:'other'}),false);
assert.equal(validateDraft({...draft,urgency:'unknown'}),false);
assert.notEqual(exampleQuotes({...draft,urgency:'urgent'})[0].amount,quotes[0].amount);

// Run the actual browser app in a DOM-shaped fake to check the wizard transitions.
function element(tag='div'){
 const attrs={};
 return {tag,value:'',textContent:'',children:[],hidden:false,disabled:false,open:false,src:'',
  className:'',style:{},attributes:attrs,
  setAttribute(k,v){attrs[k]=v;},
  addEventListener(type,cb){(this.handlers??={})[type]=cb;},
  click(){this.handlers?.click?.();},
  change(){this.handlers?.change?.();},
  input(){this.handlers?.input?.();},
  replaceChildren(...nodes){this.children=nodes},
  append(...nodes){this.children.push(...nodes)},
  scrollIntoView(){},
 };
}
const els=new Map();
const get=id=>els.get(id)||(els.set(id,element()),els.get(id));
const langBtns=['es','en','de','fr','ht'].map(code=>{const el=element('button');el.dataset={lang:code};return el});
for(const id of ['draft-category','draft-region','draft-urgency','sort'])get(id).value='';
for(const id of ['panel-1','panel-2','panel-3'])get(id).hidden=id!=='panel-1';
const document={getElementById:get,createElement:element,querySelectorAll(selector){assert.equal(selector,'[data-lang]');return langBtns},documentElement:{lang:'es'}};
const history={replaceState(){}};
const location={search:'?lang=de',href:'https://oficiord.pages.dev/demo/crear/?lang=de'};
const scope={document,history,location,URL,URLSearchParams,Option:class{constructor(label,value){this.textContent=label;this.value=value}},Object,String,Array,Number,Math};
const js=app.replace(/^import \{[^\n]+\} from '\.\/engine\.mjs';\n/,'');
vm.runInNewContext(js,{
 ...scope,regions,categories,providers,validateDraft,exampleQuotes,chooseExampleQuote
},{timeout:3500});
assert.equal(document.documentElement.lang,'de');
assert.equal(get('panel-1').hidden,false);
assert.equal(get('panel-2').hidden,true);
assert.equal(get('draft-category').value,'ac');
assert.equal(get('draft-region').value,'Higüey');
get('draft-next').click();
assert.equal(get('panel-2').hidden,false,'Step 2 is visible');
assert.equal(get('quote-list').children.length,quotes.length);
assert.equal(get('quote-count').textContent,String(quotes.length));
assert.match(get('t-compareNotice').textContent,/erfunden/);
get('sort').value='time';get('sort').change();
assert.equal(get('quote-list').children.length,quotes.length);
get('quote-list').children[0].children.at(-1).click();
assert.equal(get('panel-3').hidden,false);
assert.ok(get('choice-provider').textContent.includes('ejemplo'));
assert.equal(get('choice-job-title').textContent,get('draft-title').value);
get('back-compare').click();assert.equal(get('panel-2').hidden,false);
get('back-edit').click();assert.equal(get('panel-1').hidden,false);
// Validation must block progression and never send data.
get('draft-title').value='x';
get('draft-next').click();assert.equal(get('panel-2').hidden,true);
assert.match(get('form-error').textContent,/6–70/);
get('draft-title').value='Reparación de prueba';
get('draft-next').click();assert.equal(get('panel-2').hidden,false);
get('quote-list').children[0].children.at(-1).click();
get('reset-demo').click();
assert.equal(get('panel-1').hidden,false);
assert.equal(get('draft-title').value,'Revisión de aire acondicionado');
// Cross-language translation must not alter the selection logic or leak data.
langBtns.find(x=>x.dataset.lang==='en').click();
assert.equal(document.documentElement.lang,'en');
assert.match(get('t-headline').textContent,/Imagine/);
console.log('PASS: local-only 5-language wizard, matching, multi-quote sorting, validation, navigation, reset, privacy');
