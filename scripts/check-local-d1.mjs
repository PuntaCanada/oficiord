// Isolated local Cloudflare Workers/D1 runtime via Miniflare. NO remote bindings.
// npm install --no-save --ignore-scripts miniflare@4 (in GitHub Actions only)
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Miniflare} from 'miniflare';
const mf=new Miniflare({
 modules:true,
 script:"export default {fetch(){return new Response('test only')}}",
 d1Databases:{DB:'00000000-0000-4000-8000-000000000001'}
});
try{
 const db=await mf.getD1Database('DB');
 const migrations=[
  '0001_init.sql','0002_reports.sql','0003_marketplace.sql',
  '0004_accounts.sql','0005_magic_links.sql',
  '0006_privacy_requests.sql','0007_login_redemptions.sql'
 ];
 for(const filename of migrations){
  const sql=await readFile(new URL('../migrations/'+filename,import.meta.url),'utf8');
  await db.exec(sql);
 }
 const base=await readFile(new URL('../functions/_lib/magic-link.js',import.meta.url),'utf8');
 const baseURL='data:text/javascript;base64,'+Buffer.from(base).toString('base64');
 const lifecycle=(await readFile(new URL('../functions/_lib/atomic-login.js',import.meta.url),'utf8'))
  .replace("'./magic-link.js'","'"+baseURL+"'");
 const lib=await import('data:text/javascript;base64,'+Buffer.from(lifecycle).toString('base64'));
 const {createOpaqueToken,tokenDigest}=await import(baseURL);
 const now=1_700_000_200;
 await db.prepare("INSERT INTO accounts(id,email,role,status,email_verified_at) VALUES(?,?,?,?,?)")
  .bind('customer-test','customer@example.invalid','customer','active','2026-01-01').run();
 await db.prepare("INSERT INTO accounts(id,email,role,status,email_verified_at) VALUES(?,?,?,?,?)")
  .bind('provider-test','provider@example.invalid','provider','active','2026-01-01').run();
 await db.prepare("INSERT INTO accounts(id,email,role,status) VALUES(?,?,?,?)")
  .bind('suspended-test','suspended@example.invalid','customer','suspended').run();
 const links=[
  {id:'customer-test',expired:false},
  {id:'provider-test',expired:false},
  {id:'suspended-test',expired:false},
  {id:'customer-test',expired:true}
 ];
 const tokens=[];
 for(const link of links){
  const raw=createOpaqueToken();
  const hash=await tokenDigest(raw);
  await db.prepare("INSERT INTO account_login_tokens(token_hash,account_id,expires_at,created_at) VALUES(?,?,?,?)")
   .bind(hash,link.id,now+(link.expired?-1:300),now-100).run();
  tokens.push(raw);
 }
 // Six real D1Database.batch() calls competing for the same token in local workerd.
 const attempts=await Promise.all(Array.from({length:6},()=>
  lib.redeemAndCreateSession(db,tokens[0],now)));
 const won=attempts.filter(Boolean);
 assert.equal(won.length,1,'Only one concurrent redemption may return a cookie');
 assert.equal((await db.prepare("SELECT count(*) n FROM account_sessions WHERE account_id=?")
  .bind('customer-test').first()).n,1);
 assert.equal((await db.prepare("SELECT count(*) n FROM account_login_redemptions").first()).n,1);
 assert.equal(await lib.redeemAndCreateSession(db,tokens[0],now),null,'Replayed link');
 const providerSession=await lib.redeemAndCreateSession(db,tokens[1],now);
 assert.ok(providerSession,'Valid provider login');
 assert.equal((await db.prepare("SELECT count(*) n FROM account_sessions WHERE account_id='provider-test'").first()).n,1);
 assert.equal(await lib.redeemAndCreateSession(db,tokens[2],now),null,'Suspended user');
 assert.equal(await lib.redeemAndCreateSession(db,tokens[3],now),null,'Expired link');
 assert.equal((await db.prepare("SELECT count(*) n FROM account_sessions").first()).n,2);
 assert.equal((await db.prepare("SELECT count(*) n FROM account_login_redemptions").first()).n,2);
 assert.equal((await db.prepare("SELECT count(*) n FROM account_login_tokens WHERE used_at IS NOT NULL").first()).n,2);
 assert.ok(won[0].cookie.includes('Secure; SameSite=Lax'));
 // Force a later statement to fail. The earlier insert MUST be rolled back by batch().
 let rolledBack=false;
 try{
  await db.batch([
   db.prepare("INSERT INTO accounts(id,email,role) VALUES(?,?,?)").bind('rollback-test','rollback@example.invalid','customer'),
   db.prepare("INSERT INTO accounts(id,email,role) VALUES(?,?,?)").bind('rollback-test','other@example.invalid','customer')
  ]);
 }catch{rolledBack=true;}
 assert.equal(rolledBack,true,'D1 batch must fail on uniqueness conflict');
 assert.equal((await db.prepare("SELECT count(*) n FROM accounts WHERE id='rollback-test'").first()).n,0,'D1 batch must roll back early writes');
 console.log('PASS: local workerd D1 batch, 6-way replay race, roles, blocked/expired links, true transaction rollback');
}finally{await mf.dispose();}
