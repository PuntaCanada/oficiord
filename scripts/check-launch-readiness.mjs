// Offline launch checklist and mobile/a11y assertions; does not touch production.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const html=await read('demo/startcheck/index.html');
const app=await read('demo/startcheck/app.js');
const joint=await read('demo/recorrido/index.html');
const jointApp=await read('demo/recorrido/app.js');
const gates=await read('PRELAUNCH_RELEASE_GATES.md');
const ci=await read('.github/workflows/check-reporting.yml');
assert.match(html,/<meta name="robots" content="noindex,nofollow,noarchive"/);
assert.match(html,/<meta name="referrer" content="no-referrer"/);
assert.match(html,/<meta name="viewport" content="width=device-width,initial-scale=1"/);
assert.match(html,/<a href="#content" class="skip"/);
assert.match(html,/<main id="content"/);
assert.match(html,/@media\(max-width:650px\)/);
assert.match(html, /@media\(prefers-reduced-motion:reduce\)/);
assert.match(html, /@media\(prefers-contrast:more\)/);
assert.ok(!/<form\b/i.test(html));
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage/.test(html+app));
assert.ok(!/checkbox|type="submit"|featureToggle|ACCOUNT_ENABLED/.test(html+app));
assert.match(joint, /id="launch-link" href="\/demo\/startcheck\/"/);
assert.match(joint, /class="progress" role="status" aria-live="polite"/);
assert.match(joint, /id="thread" class="thread" aria-live="polite"/);
assert.match(joint, /\.toggle button\{flex:1\}/);
assert.match(jointApp, /launch-link'\)\.href='\/demo\/startcheck\/\?lang='/);
assert.match(gates, /NOT RELEASE-READY \/ PRODUCTION LOCKED/);
assert.match(gates, /Do \*\*not\*\* turn on any write flags|written, explicit authorization|Written, explicit authorization/i);
assert.match(gates, /iOS Safari/);
assert.match(ci, /'demo\/\*\*'/);
assert.match(ci, /'scripts\/\*\*'/);
for(const lang of ['es','en','de','fr','ht'])assert.ok(html.includes('data-lang="'+lang+'"'));
const elems=new Map();
const element=(tag='div')=>({
 tag,children:[],textContent:'',value:'',dataset:{},attributes:{},open:false,
 append(...items){this.children.push(...items);},
 replaceChildren(...items){this.children=items},
 setAttribute(k,v){this.attributes[k]=v;},
 addEventListener(k,fn){(this.events??={})[k]=fn},
 click(){this.events?.click?.()}
});
const get=id=>elems.get(id)||(elems.set(id,element()),elems.get(id));
const langs=['es','en','de','fr','ht'].map(lang=>{const b=element('button');b.dataset.lang=lang;return b;});
const doc={getElementById:get,createElement:element,querySelectorAll(s){assert.equal(s,'[data-lang]');return langs},documentElement:{lang:'es'}};
vm.runInNewContext(app,{document:doc,URL,URLSearchParams,history:{replaceState(){}},
 location:{search:'?lang=de',href:'https://oficiord.pages.dev/demo/startcheck/?lang=de'},
 Object,Array,String
},{timeout:3000});
assert.equal(doc.documentElement.lang,'de');
assert.equal(get('hold-title').textContent,'MARKTPLATZSTART GESPERRT');
assert.equal(get('complete-items').children.length,4);
assert.equal(get('blocked-items').children.length,7);
assert.equal(get('done-count').textContent,'4');
assert.equal(get('blocked-count').textContent,'7');
assert.match(get('hold-detail').textContent,/keine Startgenehmigung/i);
assert.match(get('return').href,/\/demo\/recorrido\/\?lang=de$/);
assert.ok(get('blocked-items').children.every(n=>n.className.includes('block')));
langs[1].click();
assert.equal(doc.documentElement.lang,'en');
assert.equal(get('hold-title').textContent,'LAUNCH BLOCKED');
assert.equal(get('blocked-items').children.length,7);
assert.match(get('fine').textContent,/not security/);
for(const b of langs){b.click();assert.equal(doc.documentElement.lang,b.dataset.lang);assert.equal(get('blocked-items').children.length,7)}
console.log('PASS: 5-language launch HOLD checklist, immutable blockers, responsive/accessibility markup and no demo network/storage');
