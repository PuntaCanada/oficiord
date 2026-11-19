// Deterministic offline browser-language routing tests; no browser or live server.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../i18n.js',import.meta.url),'utf8');
const accountSource=await readFile(new URL('../account/index.html',import.meta.url),'utf8');
function simulate({path='/',query='',browser=['es-DO'],saved=null}={}){
 const calls=[];
 let storage=saved;
 const nav={append(){}};
 const element=()=>({style:{},setAttribute(){},add(){},append(){},addEventListener(){},value:'',textContent:''});
 const document={
  createElement:element,
  querySelector(){return nav},
  documentElement:{lang:'es'},
  body:{},
  createTreeWalker(){return {nextNode:()=>false}},
  querySelectorAll(){return []}
 };
 const context={
  document,navigator:{languages:browser,language:browser[0]},
  localStorage:{getItem(){return storage},setItem(k,v){storage=v}},
  location:{
   pathname:path,search:query,
   replace(url){calls.push(['replace',url])},
   assign(url){calls.push(['assign',url])}
  },
  URLSearchParams,Option:class{constructor(label,value){this.label=label;this.value=value}},
  NodeFilter:{SHOW_TEXT:4},MutationObserver:class{observe(){} disconnect(){}},
  queueMicrotask(fn){fn()},WeakMap,Map,Object,String
 };
 vm.runInNewContext(source,context,{timeout:2000});
 return calls;
}
assert.deepEqual(simulate({browser:['de-DE','en-US']}),[['replace','/de/']]);
assert.deepEqual(simulate({browser:['zh-CN','en-GB']}),[['replace','/en/']]);
assert.deepEqual(simulate({browser:['pt-BR','it-IT']}),[]);
assert.deepEqual(simulate({browser:['ht-HT']}),[['replace','/ht/']]);
assert.deepEqual(simulate({browser:['de-DE'],saved:'fr'}),[['replace','/fr/']]);
assert.deepEqual(simulate({browser:['de-DE'],saved:'es'}),[]);
assert.deepEqual(simulate({browser:['fr-FR'],query:'?lang=en'}),[['replace','/en/']]);
assert.deepEqual(simulate({path:'/de/',browser:['en-US'],saved:'fr'}),[]);
assert.match(source,/flagIndicator\.textContent=flags\[current\]/);
assert.match(source,/savePreference\(language\)/);
for(const [code,flag] of Object.entries({es:'🇩🇴',en:'🇺🇸',de:'🇩🇪',fr:'🇫🇷',ht:'🇭🇹'})){
 assert.ok(source.includes(flag),code+' main flag missing');
 assert.ok(accountSource.includes(flag),code+' account flag missing');
}
assert.match(accountSource,/preferred\(\)\|\|browserLanguage\(\)/);
console.log('PASS: browser detection, Spanish fallback, explicit locale, stored preference and 5 flags');
