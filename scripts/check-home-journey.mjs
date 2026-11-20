// Actual Chromium end-to-end pilot homepage checks with *mocked* read-only API responses.
// Nothing can reach production APIs, Turnstile or any other external host.
import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
const chrome=process.env.CHROME_BIN;
assert.ok(chrome,'CHROME_BIN required for system Chrome');
const base='http://127.0.0.1:'+(process.env.PORT||8765);
const browser=await chromium.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
let checks=0;
const langs=[['es','/'],['en','/en/'],['de','/de/'],['fr','/fr/'],['ht','/ht/']];
try{
 for(const width of [320,390,768,1280]){
  const context=await browser.newContext({viewport:{width,height:820},isMobile:width<=390,hasTouch:width<=390});
  for(const [lang,path] of langs){
   const page=await context.newPage();
   const apiRequests=[];
   const pageErrors=[];
   page.on('pageerror',err=>pageErrors.push(err.message));
   await page.route('**/*',route=>{
    const request=route.request();
    const u=new URL(request.url());
    if(u.origin!==base)return route.abort(); // Turnstile is not contacted.
    if(u.pathname.startsWith('/api/')){
     apiRequests.push({method:request.method(),path:u.pathname});
     if(request.method()!=='GET')return route.abort();
     if(u.pathname==='/api/submissions'){
      return route.fulfill({status:200,contentType:'application/json',body:'{"items":[]}'});
     }
     if(u.pathname==='/api/config'){
      return route.fulfill({status:200,contentType:'application/json',body:'{"submissionsEnabled":false,"reportsEnabled":false}'});
     }
     return route.fulfill({status:503,contentType:'application/json',body:'{"ok":false,"error":"NOT_ENABLED"}'});
    }
    return route.continue();
   });
   const res=await page.goto(base+path,{waitUntil:'networkidle',timeout:18000});
   assert.equal(res.status(),200,path);
   await page.locator('.od-board-empty .od-board-action').waitFor({timeout:7000});
   assert.equal(await page.locator('.od-journey-card').count(),0,path+' no demo-first promotion');
   assert.equal(await page.locator('.od-public-start-panel').count(),1,path+' public launch available');
   assert.equal(await page.locator('.od-community-disclaimer').count(),1,path+' transparent readiness message');
   assert.equal(await page.locator('#jobs').getAttribute('aria-busy'),'false',path+' loading complete');
   assert.equal(await page.locator('.od-board-empty .od-board-action').getAttribute('href'),'#categorias');
   assert.equal(await page.locator('.od-public-actions a[href="#trabajos"]').count(),1,path+' real listing CTA');
   assert.equal(await page.locator('nav a[href^="/demo/"]').count(),0,path+' no demo navigation');
   assert.equal(await page.locator('nav a[href^="/account/"]').count(),0,path+' no disabled account navigation');
   const size=await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
   assert.ok(size.document<=size.width+2,path+' horizontal overflow '+JSON.stringify(size));
   assert.ok(size.body<=size.width+2,path+' body overflow '+JSON.stringify(size));
   assert.deepEqual(pageErrors,[],path+' JS errors');
   assert.ok(apiRequests.every(x=>x.method==='GET'),path+' no actual write requests');
   if(width===390&&lang==='de'){
    await page.locator('button[data-kind="job"]').first().click();
    assert.equal(await page.locator('#send').isDisabled(),true,'Closed submissions never enable send button');
    await page.locator('#close').click();
    // When the (mocked) read-only board fails, a friendly recovery link must appear.
    await page.route('**/api/submissions?*',route=>route.fulfill({status:503,contentType:'application/json',body:'{"error":"NOT_ENABLED"}'}));
    await page.locator('#find').click();
    await page.locator('.od-board-empty .od-board-action').waitFor();
    assert.equal(await page.locator('.od-board-empty .od-board-action').getAttribute('href'),'#categorias');
    await page.locator('.od-board-empty .od-board-action').click();
    assert.equal(new URL(page.url()).hash,'#categorias');
    assert.equal(await page.locator('#form').isVisible(),false,'No personal information form while closed');
    checks+=3;
   }
   if(width===390&&lang==='es'){
    // A synthetic, approved listing can receive a moderated enquiry without exposing email publicly.
    await page.route('**/api/config',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({submissionsEnabled:false,contactRequestsEnabled:true,turnstileSiteKey:'mock-site-key'})}));
    await page.route('**/api/submissions?*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
     items:[{id:'a1234567-1234-4234-9234-123456789012',title:'Prueba de mantenimiento',city:'Higüey',category:'Plomería',description:'Entrada ficticia para prueba segura.'}]
    })}));
    await page.locator('#find').click();
    const btn=page.locator('.od-contact-button');
    await btn.waitFor();
    assert.equal(await page.locator('#jobs').innerText().then(s=>s.includes('person@example.org')),false,'No private email on public board');
    await btn.click();
    assert.equal(await page.locator('.od-contact-dialog[open]').count(),1,'Contact dialogue opens for approved listing');
    assert.equal(await page.locator('.od-contact-form input[type="email"]').count(),1,'One contact email field');
    assert.equal(await page.locator('.od-contact-consent input[type="checkbox"]').count(),1,'Consent required');
    assert.ok(apiRequests.every(x=>x.method==='GET'),'No real writes during contact browsing');
    checks+=4;
   }
   await page.close();checks++;
  }
  await context.close();
 }
 console.log('PASS: '+checks+' real Chrome homepage/mobile/locale/empty/failure/closed-write/CTA scenarios with localhost API mocks');
}finally{await browser.close();}
