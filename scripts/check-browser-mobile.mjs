// Real headless Google Chrome checks on GitHub runner, static localhost only.
// No Cloudflare credentials, production APIs, external hosts or persistent data.
import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
const PORT=Number(process.env.PORT||8765);
const base='http://127.0.0.1:'+PORT;
const executablePath=process.env.CHROME_BIN;
assert.ok(executablePath,'CHROME_BIN must be the preinstalled runner Chrome binary');
const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage']});
let scenarios=0;
const problems=[];
async function openPage(context,path){
 const page=await context.newPage();
 page.on('pageerror',err=>problems.push(path+': JS '+err.message));
 page.on('response',response=>{
  if(response.url().startsWith(base)&&response.status()>=400)problems.push(path+': HTTP '+response.status()+' '+response.url());
 });
 await page.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(url.origin!==base||url.pathname.startsWith('/api/')){
   problems.push(path+': forbidden external/API request '+url.pathname);
   return route.abort();
  }
  return route.continue();
 });
 const res=await page.goto(base+path,{waitUntil:'networkidle',timeout:15000});
 assert.equal(res.status(),200,path+' HTML');
 await page.locator('h1').first().waitFor({timeout:7000});
 return page;
}
async function noHorizontalOverflow(page,width,label){
 const info=await page.evaluate(()=>({
  doc:document.documentElement.scrollWidth,
  body:document.body.scrollWidth,
  win:window.innerWidth,
  main:document.querySelector('main')?.getBoundingClientRect().width
 }));
 assert.ok(info.doc<=info.win+2,label+' document overflow: '+JSON.stringify(info));
 assert.ok(info.body<=info.win+2,label+' body overflow: '+JSON.stringify(info));
}
async function accessibilityChecks(page,path){
 const errors=await page.locator('button,input,select,textarea').evaluateAll(elements=>elements.filter(el=>{
  const style=getComputedStyle(el);
  if(style.display==='none'||style.visibility==='hidden'||el.closest('[hidden]'))return false;
  if(el.tagName==='BUTTON')return !((el.textContent||'').trim()||el.getAttribute('aria-label')||el.getAttribute('aria-labelledby'));
  return !(el.labels?.length||el.getAttribute('aria-label')||el.getAttribute('aria-labelledby')||el.getAttribute('title'));
 }).map(el=>el.outerHTML.slice(0,160)));
 assert.deepEqual(errors,[],path+' visible controls without accessible names');
 const hasReducedMotion=await page.evaluate(()=>Array.from(document.styleSheets).some(sheet=>{
  try{return [...sheet.cssRules].some(rule=>rule.conditionText?.includes('prefers-reduced-motion'));}catch{return false;}
 }));
 assert.equal(hasReducedMotion,true,path+' reduced motion rule');
}
async function navigationChecks(page,path){
 const nav=page.locator('#demo-cross-navigation nav');
 await nav.waitFor({state:'visible'});
 const links=nav.locator('a.od-demo-nav-link');
 assert.equal(await links.count(),6,path+' must link every demo');
 assert.equal(await nav.locator('a[aria-current="page"]').count(),1,path+' current page');
 const locale=new URL(page.url()).searchParams.get('lang')||'es';
 const paths=await links.evaluateAll(items=>items.map(a=>new URL(a.href).pathname));
 assert.deepEqual(paths,['/demo/','/demo/crear/','/demo/cliente/','/demo/profesional/','/demo/recorrido/','/demo/startcheck/']);
 for(const href of await links.evaluateAll(items=>items.map(a=>a.getAttribute('href')))){
  assert.ok(href.endsWith('?lang='+locale),path+' language not preserved: '+href);
 }
 const navOverflow=await nav.evaluate(el=>el.scrollWidth>el.clientWidth+2);
 assert.equal(navOverflow,false,path+' nav container must not overflow page');
}
async function documentChecks(page,path){
 assert.equal(await page.locator('meta[name=robots]').getAttribute('content'),'noindex,nofollow,noarchive',path);
 assert.equal(await page.locator('main').count(),1,path+' main landmark');
 assert.ok(await page.locator('a[href^="#"]').count()>0,path+' skip-navigation');
 await page.locator('img').first().waitFor({state:'visible'});
 const src=await page.locator('img').first().getAttribute('src');
 assert.ok(src,path+' image');
 const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src));
 assert.deepEqual(broken,[],path+' broken images');
}
try{
 for(const width of [320,390,768,1280]){
  const context=await browser.newContext({viewport:{width,height:800},deviceScaleFactor:1,isMobile:width<=390,hasTouch:width<=390});
  for(const [path,ready] of [
   ['/demo/recorrido/?lang=de','#offers .offer'],
   ['/demo/cliente/?lang=de','#quote-list .quote'],
   ['/demo/profesional/?lang=de','#jobs .job'],
   ['/demo/crear/?lang=de','#draft-next'],
   ['/demo/startcheck/?lang=de','#blocked-items .item'],
   ['/demo/?lang=de','#jobs .card']
  ]){
   const page=await openPage(context,path);
   await page.locator(ready).first().waitFor({timeout:7000});
   await noHorizontalOverflow(page,width,path);
   await documentChecks(page,path);
   await navigationChecks(page,path);
   await accessibilityChecks(page,path);
   scenarios++;
   await page.close();
  }
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 // Real navigation between demos must preserve locale and active-tab state.
 const hub=await openPage(context,'/demo/?lang=de');
 await hub.locator('#demo-cross-navigation a[href="/demo/crear/?lang=de"]').click();
 assert.ok(hub.url().includes('/demo/crear/?lang=de'));
 assert.equal(await hub.locator('#demo-cross-navigation a[aria-current="page"]').getAttribute('href'),'/demo/crear/?lang=de');
 await hub.locator('[data-lang="en"]').first().click();
 await hub.locator('#demo-cross-navigation a[href="/demo/cliente/?lang=en"]').waitFor({timeout:4000});
 await hub.locator('#demo-cross-navigation a[href="/demo/cliente/?lang=en"]').click();
 assert.ok(hub.url().includes('/demo/cliente/?lang=en'));
 await hub.locator('#demo-cross-navigation a[aria-current="page"]').waitFor();
 assert.equal(await hub.locator('#demo-cross-navigation a[aria-current="page"]').getAttribute('href'),'/demo/cliente/?lang=en');
 scenarios++;
 await hub.close();
 const journey=await openPage(context,'/demo/recorrido/?lang=de');
 await journey.locator('#offers .offer button').first().click();
 assert.equal(await journey.locator('#prepare').isDisabled(),true,'Customer cannot prepare provider offer');
 await journey.locator('#view-provider').click();
 assert.equal(await journey.locator('#prepare').isEnabled(),true);
 await journey.locator('#prepare').click();
 assert.equal(await journey.locator('#phase-prepared').getAttribute('data-current'),'true');
 await journey.locator('#view-customer').click();
 await journey.locator('#confirm').click();
 assert.equal(await journey.locator('#phase-selected').getAttribute('data-current'),'true');
 await journey.locator('#reply-one').click();
 assert.equal(await journey.locator('#thread .bubble').count(),3);
 await journey.locator('#view-provider').click();
 assert.equal(await journey.locator('#thread .bubble').count(),3);
 await journey.locator('#job').selectOption('s2');
 assert.equal(await journey.locator('#phase-open').getAttribute('data-current'),'true');
 assert.equal(await journey.locator('#thread .bubble').count(),0);
 await journey.locator('#reset').click();
 assert.equal(await journey.locator('#job').inputValue(),'s1');
 scenarios++;
 await journey.close();
 const quote=await openPage(context,'/demo/crear/?lang=de');
 await quote.locator('#draft-title').fill('x');
 await quote.locator('#draft-next').click();
 assert.equal(await quote.locator('#draft-title').getAttribute('aria-invalid'),'true');
 assert.equal(await quote.locator('#panel-2').isVisible(),false);
 assert.equal(await quote.evaluate(()=>document.activeElement?.id),'draft-title');
 await quote.locator('#draft-title').fill('Beispielprüfung einer Klimaanlage');
 assert.equal(await quote.locator('#draft-title').getAttribute('aria-invalid'),'false');
 await quote.locator('#draft-next').click();
 assert.equal(await quote.evaluate(()=>document.activeElement?.id),'panel-2','Focus enters comparison step');
 assert.ok(await quote.locator('#quote-list .quote-card').count()>=3,'More than two sample quotes');
 await quote.locator('#quote-list .quote-card button').first().click();
 assert.equal(await quote.locator('#panel-3').isVisible(),true);
 assert.equal(await quote.evaluate(()=>document.activeElement?.id),'panel-3','Focus enters fictional selection step');
 await quote.locator('#reset-demo').click();
 assert.equal(await quote.locator('#panel-1').isVisible(),true);
 assert.equal(await quote.evaluate(()=>document.activeElement?.id),'panel-1','Focus returns to first step');
 scenarios++;
 await quote.close();
 const provider=await openPage(context,'/demo/profesional/?lang=de');
 await provider.locator('#jobs .job button').first().click();
 assert.equal(await provider.locator('#offer-editor').isVisible(),true);
 await provider.locator('#amount').fill('10');
 await provider.locator('#save-offer').click();
 assert.equal(await provider.locator('#form-error').isVisible(),true);
 await provider.locator('#amount').fill('3500');
 await provider.locator('#save-offer').click();
 assert.equal(await provider.locator('#offers .offer-card').count(),1);
 // Unmatched search now offers a one-tap recovery that restores the provider's areas.
 await provider.locator('#search').fill('unmatched xyz 123');
 assert.equal(await provider.locator('#jobs .job').count(),0);
 assert.equal(await provider.locator('#clear-filters').isVisible(),true);
 await provider.locator('#clear-filters').click();
 assert.ok(await provider.locator('#jobs .job').count()>0);
 assert.equal(await provider.locator('#search').inputValue(),'');
 assert.equal(await provider.locator('#clear-filters').isVisible(),false);
 await provider.locator('#reply-one').click();
 assert.equal(await provider.locator('#thread .msg').count(),3);
 scenarios++;
 await provider.close();
 const customer=await openPage(context,'/demo/cliente/?lang=de');
 await customer.locator('#quote-list .quote .quote-actions button').first().click();
 assert.equal(await customer.locator('#comparison-list .compare-column').count(),1);
 await customer.locator('#quote-list .quote .quote-actions button').nth(1).click();
 assert.equal(await customer.locator('#status-selected').getAttribute('data-active'),'true');
 await customer.locator('#job-two').click();
 assert.equal(await customer.locator('#comparison-list .compare-column').count(),0);
 scenarios++;
 await customer.close();
 for(const [lang,expected] of [['es','Del cliente al profesional'],['en','One fictional job'],['de','Ein fiktiver Auftrag'],['fr','Un travail fictif'],['ht','Yon travay envante']]){
  const page=await openPage(context,'/demo/recorrido/?lang='+lang);
  assert.ok((await page.locator('h1').innerText()).includes(expected),'Language '+lang+' title');
  await page.locator('#offers .offer').first().waitFor();
  scenarios++;
  await page.close();
 }
 // Keyboard-only navigation: first Tab should reveal a skip link.
 const keyboardContext=await browser.newContext({viewport:{width:1280,height:800}});
 const keyboard=await openPage(keyboardContext,'/demo/recorrido/?lang=de');
 await keyboard.keyboard.press('Tab');
 assert.equal(await keyboard.evaluate(()=>document.activeElement?.classList.contains('skip-to-content')),true,'Visible first keyboard focus is skip link');
 await keyboard.keyboard.press('Enter');
 assert.equal(await keyboard.evaluate(()=>document.activeElement===document.querySelector('main')||location.hash==='#main-content'),true);
 scenarios++;
 await keyboard.close();
 await keyboardContext.close();
 // Browser state is ephemeral; reload should reset the demo flow.
 const reset=await openPage(context,'/demo/recorrido/?lang=de');
 assert.equal(await reset.locator('#phase-open').getAttribute('data-current'),'true');
 assert.equal(await reset.locator('#thread .bubble').count(),0);
 scenarios++;
 await reset.close();
 await context.close();
 // Degraded experience should be explicit when JavaScript is unavailable.
 const disabled=await browser.newContext({viewport:{width:375,height:812},javaScriptEnabled:false});
 for(const route of ['/demo/','/demo/crear/','/demo/cliente/','/demo/profesional/','/demo/recorrido/','/demo/startcheck/']){
  const page=await openPage(disabled,route+'?lang=de');
  assert.equal(await page.locator('.od-noscript').isVisible(),true,route+' visible no-JS explanation');
  assert.ok((await page.locator('.od-noscript').innerText()).includes('JavaScript'));
  assert.equal(await page.locator('.od-noscript a[href="/"]').count(),1);
  scenarios++;await page.close();
 }
 await disabled.close();
 assert.deepEqual(problems,[],'Unexpected browser errors or outbound requests');
 console.log('PASS: '+scenarios+' actual Chromium checks (mobile 320/390/768/1280, 5 languages, both roles, example quotes, forms, keyboard, privacy)');
}finally{
 await browser.close();
}
