// No real Cloudflare calls or personal information; exercise mocked administrator views in Chromium.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const browser=await chromium.launch({headless:true});
const base='http://127.0.0.1:4173';
let assertions=0;
const uuid='c767bc1e-4f37-433e-a5ba-bdf25577df10';
try{
 for(const width of [375,768,1365]){
  const context=await browser.newContext({viewport:{width,height:850}});
  const page=await context.newPage();
  const errors=[],calls=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/api/admin/**',async route=>{
   const req=route.request(),url=new URL(req.url());
   calls.push({path:url.pathname,method:req.method(),auth:req.headers().authorization});
   if(req.method()!=='GET')return route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({error:'READ_ONLY_TEST'})});
   if(!req.headers().authorization?.startsWith('Bearer '))return route.fulfill({status:401,contentType:'application/json',body:'{"error":"UNAUTHORIZED"}'});
   const records=url.pathname.includes('contact-requests')?[{id:uuid,listing_title:'Example job',listing_status:'approved',sender_email:'synthetic@example.invalid',listing_contact_email:'owner@example.invalid',message:'Synthetic contact text',created_at:'2026-01-01'}]:url.pathname.includes('reports')?[{id:uuid,listing_title:'Example job',listing_status:'approved',reason:'spam',details:'Synthetic report text',submission_id:uuid,created_at:'2026-01-01'}]:[{id:uuid,kind:'job',title:'Example job',city:'Higüey',category:'Pintura',description:'Synthetic description',status:'pending',created_at:'2026-01-01'}];
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({items:records})});
  });
  const res=await page.goto(base+'/admin/',{waitUntil:'networkidle'});
  assert.equal(res.status(),200);assert.equal(await page.locator('html').getAttribute('lang'),'de');
  assert.match(await page.locator('h1').textContent(),/Moderation/);
  assert.equal(await page.locator('#view option').first().textContent(),'Anzeigen');
  assert.equal(await page.locator('input[type=password]').count(),1);
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=2,'mobile overflow');
  assertions+=5;
  for(const [language,term,contact,approved] of [['en','Inbox','Contact requests (manual review)','Approved'],['es','Bandeja','Contactos (revisión manual)','Aprobadas'],['de','Posteingang','Kontaktanfragen (manuelle Prüfung)','Freigegeben']]){
   await page.locator('#locale').selectOption(language);
   assert.equal(await page.locator('html').getAttribute('lang'),language);
   assert.equal(await page.locator('label[for=view]').textContent(),term);
   assert.equal(await page.locator('#view option[value=contacts]').textContent(),contact);
   assert.equal(await page.locator('#filter option[value=approved]').textContent(),approved);
   assertions+=4;
  }
  // Accessing without a key never sends a request; entering it and loading hides it from the input.
  await page.locator('#load').click();
  assert.equal(calls.length,0);
  await page.locator('#token').fill('a'.repeat(44));
  await page.locator('#load').click();
  await page.locator('article.entry').waitFor();
  assert.equal(await page.locator('#token').inputValue(),'');
  assert.ok(calls.at(-1).auth.startsWith('Bearer '));
  assert.equal(await page.locator('article.entry button').count(),3,'approve/reject/delete actions');
  assertions+=4;
  // Verify filters are translated and API status values are unchanged.
  await page.locator('#view').selectOption('contacts');
  assert.equal(await page.locator('#filter option[value=handled]').count(),1);
  await page.locator('#load').click();
  await page.locator('article.entry').waitFor();
  assert.match(await page.locator('.entry').innerText(),/synthetic@example.invalid/);
  await page.locator('#view').selectOption('reports');
  assert.equal(await page.locator('#filter option[value=reviewed]').count(),1);
  await page.locator('#load').click();
  await page.locator('article.entry').waitFor();
  assertions+=3;
  // No API mutations during viewing and language switching.
  assert.ok(calls.every(c=>c.method==='GET'));
  assert.deepEqual(errors,[]);
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=2,'mobile overflow after language changes');
  assertions+=3;
  if(width===375){
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
   const serious=axe.violations.filter(v=>['critical','serious'].includes(v.impact));
   assert.equal(serious.length,0,JSON.stringify(serious.map(v=>v.id)));assertions++;
  }
  await page.locator('#clear').click();
  assert.equal(await page.locator('#token').inputValue(),'');
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('html').getAttribute('lang'),'de','persisted locale is German');
  assertions+=2;
  await context.close();
 }
 console.log('PASS '+assertions+' localized German/English/Spanish moderation Chromium checks across 3 viewports. No real writes.');
}finally{await browser.close()}
