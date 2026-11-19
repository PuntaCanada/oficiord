// Browser regression: only static, fictional OficioRD demos; never create real records.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const base='http://127.0.0.1:4173';
const paths=['/','/account/','/demo/','/demo/crear/','/demo/cliente/','/demo/profesional/','/demo/recorrido/','/demo/startcheck/'];
const demoPaths=paths.filter(p=>p.startsWith('/demo/'));
const browser=await chromium.launch({headless:true});
let failures=0;
for(const width of [390,768,1365]){
 const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
 for(const path of paths){
  const page=await context.newPage();
  const errors=[],writes=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',req=>{if(!['GET','HEAD'].includes(req.method()))writes.push(req.method()+' '+req.url())});
  try{
   const response=await page.goto(base+path+'?lang=es',{waitUntil:'networkidle',timeout:25000});
   if(!response?.ok())throw new Error('HTTP '+response?.status());
   await page.waitForTimeout(150);
   const x=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,title:document.title}));
   if(x.width>x.viewport+2)throw new Error('Horizontal overflow '+x.width+' > '+x.viewport);
   if(!x.title.includes('OficioRD'))throw new Error('Page title missing');
   if(errors.length)throw new Error('JavaScript: '+errors.join('; '));
   if(writes.length)throw new Error('Unexpected network writes: '+writes.join('; '));
   if(path.startsWith('/demo/')){
    const links=page.locator('.od-demo-nav-link');
    await links.first().waitFor();
    if(await links.count()!==6)throw new Error('Demo navigation links missing');
    if(await page.locator('.od-demo-nav-link[aria-current="page"]').count()!==1)throw new Error('Current navigation location missing');
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    const severe=axe.violations.filter(v=>['critical','serious'].includes(v.impact));
    if(severe.length)throw new Error('Accessibility: '+severe.map(v=>v.id+' ('+v.nodes.length+')').join(', '));
   }
   if(path==='/account/'){
    if(await page.locator('#email').isEnabled()||await page.locator('#login').isEnabled())throw new Error('Real login unexpectedly enabled');
   }
   console.log('PASS',width,path);
  }catch(e){failures++;console.error('FAIL',width,path,e.message);}
  await page.close();
 }
 // Real navigation: simulate a visitor switching between demo pages.
 const page=await context.newPage();
 try{
  await page.goto(base+'/demo/?lang=es',{waitUntil:'networkidle'});
  await page.locator('.od-demo-nav-link[href^="/demo/cliente/"]').click();
  await page.waitForURL('**/demo/cliente/?lang=es');
  if(await page.locator('.od-demo-nav-link[aria-current="page"]').textContent()!=='Cliente')throw new Error('Wrong active demo link');
  console.log('PASS',width,'customer journey navigation');
 }catch(e){failures++;console.error('FAIL navigation',width,e.message)}
 await page.close();
 await context.close();
}
await browser.close();
if(failures){console.error(failures+' browser regressions');process.exitCode=1}
else console.log('All demo browser and accessibility checks passed');
