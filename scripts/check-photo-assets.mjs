// Offline checks for self-hosted AI-generated demonstration photos.
// No network or user data; never confuse these example profiles with real businesses.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const assets=['hero','hvac','plumbing','electric','cleaning','appliances'];
for(const name of assets){
 const path=new URL('assets/oficiord-'+name+'.webp',root);
 const buf=await readFile(path);
 assert.equal(buf.subarray(0,4).toString('ascii'),'RIFF',name+' bad image header');
 assert.equal(buf.subarray(8,12).toString('ascii'),'WEBP',name+' invalid WebP');
 assert.ok(buf.length>5000&&buf.length<200000,name+' suspicious size');
}
for(const path of ['index.html','en/index.html','de/index.html','fr/index.html','ht/index.html']){
 const html=await readFile(new URL(path,root),'utf8');
 assert.ok(html.includes('src="/assets/oficiord-hero.webp"'),path+' has no hero photo');
 assert.ok(html.includes('category-photo'),path+' has no category photos');
 assert.ok(html.includes("'Aire acondicionado':'hvac'"),path+' has no AC category mapping');
 assert.ok(html.includes("'Plomería':'plumbing'"),path+' has no plumbing category mapping');
 assert.ok(html.includes("'Limpieza':'cleaning'"),path+' has no cleaner image mapping');
 assert.ok(html.includes('<figcaption>'),path+' must identify illustration');
}
const demo=await readFile(new URL('demo/index.html',root),'utf8');
for(const name of assets.slice(1))assert.ok(demo.includes("'"+name+"'"),name+' missing from marketplace image map');
assert.ok(demo.includes('imageNote'),'Demo photos must be disclosed');
assert.ok(!/fetch\s*\(/.test(demo),'Example photos must not trigger external API calls');
const account=await readFile(new URL('account/index.html',root),'utf8');
assert.ok(account.includes('card-image')&&account.includes('imageNote'));
console.log('PASS: all six generated WebP files, 5-language hero/category imagery, disclosed demo profiles');
