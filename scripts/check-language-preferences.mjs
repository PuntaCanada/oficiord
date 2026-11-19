// Offline behavior tests: Spanish root, explicit language URLs and real SVG flags.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const js=await read('i18n.js');
const languages={es:'Español',en:'English',de:'Deutsch',fr:'Français',ht:'Kreyòl ayisyen'};
const paths={es:'index.html',en:'en/index.html',de:'de/index.html',fr:'fr/index.html',ht:'ht/index.html'};
for(const [lang,path] of Object.entries(paths)){
 const html=await read(path);
 assert.match(html,/<details id="language-picker"/);
 assert.match(html,new RegExp('src="/flags/'+lang+'\\.svg"'));
 assert.match(html,new RegExp('data-language="'+lang+'"'));
 assert.match(html,/<div class="language-options"/);
 assert.match(html,/<div class="language-controls"/);
 const top=html.slice(html.indexOf('<div class="language-controls"'),html.indexOf('<details id="language-picker"'));
 const menu=html.slice(html.indexOf('<details id="language-picker"'),html.indexOf('</details>',html.indexOf('<details id="language-picker"')));
 for(const visible of ['es','en']){
  assert.ok(top.includes('data-language="'+visible+'"'),path+' '+visible+' must be directly visible');
  assert.ok(top.includes('src="/flags/'+visible+'.svg"'),path+' direct flag missing');
  assert.ok(!menu.includes('data-language="'+visible+'"'),path+' '+visible+' must not be in dropdown');
 }
 for(const hidden of ['de','fr','ht']){
  assert.ok(!top.includes('data-language="'+hidden+'"'),path+' '+hidden+' must not be directly visible');
  assert.ok(menu.includes('data-language="'+hidden+'"'),path+' dropdown '+hidden+' missing');
  assert.ok(menu.includes('src="/flags/'+hidden+'.svg"'),path+' dropdown flag missing');
 }
 for(const langOption of Object.keys(languages)){
  assert.ok(html.includes('src="/flags/'+langOption+'.svg"'),path+' missing '+langOption+' flag');
  assert.ok(html.includes('data-language="'+langOption+'"'),path+' missing '+langOption+' link');
 }
 const icon=await read('flags/'+lang+'.svg');
 assert.ok(icon.startsWith('<svg')&&icon.includes('viewBox="0 0 30 20"'));
}
const account=await read('account/index.html');
assert.match(account,/<details class="account-lang-menu"/);
const accountTop=account.slice(account.indexOf('<div class="account-lang-controls"'),account.indexOf('<details class="account-lang-menu"'));
const accountMenu=account.slice(account.indexOf('<details class="account-lang-menu"'),account.indexOf('</details>',account.indexOf('<details class="account-lang-menu"')));
for(const visible of ['es','en']){
 assert.ok(accountTop.includes('data-lang="'+visible+'"'));
 assert.ok(!accountMenu.includes('data-lang="'+visible+'"'));
}
for(const hidden of ['de','fr','ht']){
 assert.ok(!accountTop.includes('data-lang="'+hidden+'"'));
 assert.ok(accountMenu.includes('data-lang="'+hidden+'"'));
}
assert.match(account,/let selectedLanguage=supported\(selected\)\?selected:'es'/);
for(const lang of Object.keys(languages)){
 assert.ok(account.includes('data-lang="'+lang+'"'));
 assert.ok(account.includes('src="/flags/'+lang+'.svg"'));
}
function route({path='/',query='',browser=['en-US'],saved='en'}={}){
 const actions=[];
 const menu={querySelector(){return {textContent:''}},querySelectorAll(){return []}};
 const doc={
  getElementById(){return menu},
  documentElement:{lang:'es',style:{}},title:'',
  body:{},createTreeWalker(){return {nextNode:()=>false}},querySelectorAll(){return []}
 };
 const context={
  location:{pathname:path,search:query,replace(url){actions.push(url)}},
  navigator:{languages:browser,language:browser[0]},
  localStorage:{getItem(){return saved},setItem(){}},
  document:doc,URLSearchParams,Object,Map,WeakMap,
  NodeFilter:{SHOW_TEXT:4},MutationObserver:class{observe(){} disconnect(){}},
  queueMicrotask:fn=>fn()
 };
 vm.runInNewContext(js,context,{timeout:2000});
 return {actions,lang:doc.documentElement.lang};
}
assert.deepEqual(route({browser:['en-US'],saved:'en'}).actions,[]);
assert.equal(route({browser:['de-DE'],saved:'de'}).lang,'es');
assert.equal(route({path:'/en/'}).lang,'en');
assert.equal(route({path:'/de/'}).lang,'de');
assert.deepEqual(route({query:'?lang=fr'}).actions,['/fr/']);
console.log('PASS: Spanish root, visible ES/EN flag links, other 3 flags in dropdown, account demo');
