// Offline integration contract test: no D1 Production, email, registration or network.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const magic=await read('functions/_lib/magic-link.js');
const magicURL='data:text/javascript;base64,'+Buffer.from(magic).toString('base64');
const atomic=(await read('functions/_lib/atomic-login.js')).replace("'./magic-link.js'","'"+magicURL+"'");
const atomicURL='data:text/javascript;base64,'+Buffer.from(atomic).toString('base64');
const {createOpaqueToken,tokenDigest}=await import(magicURL);
const {redeemAndCreateSession}=await import(atomicURL);
const token=createOpaqueToken(),hash=await tokenDigest(token);
function makeDb(mode='valid'){
 const statements=[];
 let batched=0;
 return {statements,get batches(){return batched;},
   prepare(sql){return {bind(...params){const statement={sql,params};statements.push(statement);return statement;}}},
   async batch(items){
    batched++;assert.equal(items.length,3);
    assert.match(items[0].sql,/INSERT INTO account_login_redemptions/);
    assert.match(items[0].sql,/t.used_at IS NULL/);
    assert.match(items[0].sql,/t.expires_at>\?/);
    assert.match(items[0].sql,/email_verified_at IS NOT NULL/);
    assert.match(items[1].sql,/INSERT INTO account_sessions/);
    assert.match(items[1].sql,/r.session_hash=\?/);
    assert.match(items[2].sql,/UPDATE account_login_tokens SET used_at/);
    assert.equal(items[0].params[2],hash);
    assert.equal(items[1].params[2],hash);
    assert.equal(items[2].params[1],hash);
    if(mode==='failure')throw new Error('D1_BATCH_ROLLBACK');
    if(mode==='replay')return [{meta:{changes:0}},{meta:{changes:0}},{meta:{changes:0}}];
    if(mode==='partial')return [{meta:{changes:1}},{meta:{changes:0}},{meta:{changes:0}}];
    return [{meta:{changes:1}},{meta:{changes:1}},{meta:{changes:1}}];
   }
 };
}
const valid=makeDb();
const session=await redeemAndCreateSession(valid,token,1700000000);
assert.equal(valid.batches,1);
assert.equal(valid.statements.length,3);
assert.match(session.cookie,/__Host-oficiord_session=[0-9a-f]{64}/);
assert.match(session.cookie,/Secure; SameSite=Lax/);
assert.equal(session.expiresAt,1700086400);
const raw=session.cookie.match(/session=([0-9a-f]{64})/)[1];
assert.notEqual(raw,valid.statements[0].params[0]);
assert.equal(await tokenDigest(raw),valid.statements[0].params[0]);
assert.equal(valid.statements[0].params[0],valid.statements[1].params[0]);
assert.equal(valid.statements[2].params[3],valid.statements[0].params[0]);
for(const mode of ['failure','replay','partial']){
 const db=makeDb(mode);
 assert.equal(await redeemAndCreateSession(db,token,1700000000),null,mode);
}
const invalid=makeDb();
assert.equal(await redeemAndCreateSession(invalid,'bad',1700000000),null);
assert.equal(invalid.batches,0);
console.log('PASS: atomic batch contract, hashed tokens, no cookie on replay, partial or DB error');
