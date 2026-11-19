// Offline UI behavior test: no network, no backend and no real user data.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const html=await readFile(new URL('../demo/index.html',import.meta.url),'utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert.ok(js);
assert.ok(!/\bfetch\s*\(/.test(js),'Demo must never send HTTP requests');
assert.ok(!/XMLHttpRequest|sendBeacon|WebSocket/.test(js));
assert.ok(html.includes('name="robots" content="noindex,nofollow,noarchive"'));
const elements=new Map();
const createNode=(tag='div')=>({
 tag,textContent:'',className:'',dataset:{},hidden:false,children:[],
 append(...children){this.children.push(...children);},
 replaceChildren(...children){this.children=[...children];},
 classList:{toggle(){}},setAttribute(){},addEventListener(name,cb){this['on'+name]=cb;},
 showModal(){this.open=true},close(){this.open=false},
 options:[],value:'',placeholder:''
});
const get=id=>{
 if(!elements.has(id))elements.set(id,createNode());
 return elements.get(id);
};
for(const id of ['city','category'])get(id).options=[{textContent:''},{value:'ac'},{value:'plumbing'},{value:'electric'},{value:'clean'},{value:'paint'},{value:'appliance'}];
get('city').value='';get('category').value='';get('q').value='';
const langButtons=['es','en','de','fr','ht'].map(k=>{const node=createNode('button');node.dataset.lang=k;return node});
const doc={
 getElementById:get,createElement:createNode,
 querySelectorAll(selector){assert.equal(selector,'[data-lang]');return langButtons},
 documentElement:{lang:'es'}
};
const context={
 document:doc,URL,URLSearchParams,history:{replaceState(){}},
 location:{search:'',href:'https://oficiord.pages.dev/demo/'},
 Option:class{constructor(text,value){this.textContent=text;this.value=value}},
 Number,Object,Math,String,Array
};
vm.runInNewContext(js,context,{timeout:2000});
assert.equal(get('jobs').children.length,6);
assert.equal(get('pros').children.length,4);
get('city').value='Higüey';get('city').onchange();
assert.equal(get('jobs').children.length,2);
assert.equal(get('pros').children.length,2);
get('category').value='ac';get('category').onchange();
assert.equal(get('jobs').children.length,1);
assert.equal(get('pros').children.length,1);
get('category').value='plumbing';get('category').onchange();
assert.equal(get('jobs').children.length,0);
assert.equal(get('jobs-empty').hidden,false);
get('clear').onclick();
assert.equal(get('jobs').children.length,6);
get('q').value='lavadora';get('q').oninput();
assert.equal(get('jobs').children.length,1);
get('clear').onclick();
langButtons[2].onclick();
assert.equal(doc.documentElement.lang,'de');
assert.equal(get('jobs-title').textContent,'Beispielaufträge');
assert.equal(get('pros-title').textContent,'Beispiel-Handwerker');
assert.equal(get('jobs').children.length,6);
assert.equal(get('dialog').open,undefined);
get('show').onclick();
assert.equal(get('dialog').open,true);
get('price').value='3500';
get('offer-form').onsubmit({preventDefault(){}});
assert.ok(get('result').textContent.includes('nichts versendet'));
get('close').onclick();
assert.equal(get('dialog').open,false);
for(const lang of ['es','en','de','fr','ht'])assert.ok(html.includes('data-lang="'+lang+'"'));
console.log('PASS: 6 fake jobs, 4 fake pros, regional and category filtering, search, localized demo, no network');
