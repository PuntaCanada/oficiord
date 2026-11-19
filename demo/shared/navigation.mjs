// A single, read-only navigator shared by all fictional OficioRD demo pages.
// Language is in the URL or the document's language; no cookies/storage/APIs.
const pages=[
 {key:'explore',path:'/demo/'},
 {key:'create',path:'/demo/crear/'},
 {key:'customer',path:'/demo/cliente/'},
 {key:'professional',path:'/demo/profesional/'},
 {key:'journey',path:'/demo/recorrido/'},
 {key:'safety',path:'/demo/startcheck/'}
];
const labels={
 es:{heading:'Explorar demos',explore:'Mercado',create:'Crear trabajo',customer:'Cliente',professional:'Profesional',journey:'Recorrido',safety:'Seguridad'},
 en:{heading:'Explore demos',explore:'Marketplace',create:'Create job',customer:'Customer',professional:'Professional',journey:'Walkthrough',safety:'Safety'},
 de:{heading:'Demos entdecken',explore:'Marktplatz',create:'Auftrag erstellen',customer:'Kunde',professional:'Handwerker',journey:'Gesamtablauf',safety:'Sicherheit'},
 fr:{heading:'Explorer les démos',explore:'Marché',create:'Créer un travail',customer:'Client',professional:'Artisan',journey:'Parcours',safety:'Sécurité'},
 ht:{heading:'Gade demo yo',explore:'Mache',create:'Kreye travay',customer:'Kliyan',professional:'Pwofesyonèl',journey:'Pakou',safety:'Sekirite'}
};
const root=document.getElementById('demo-cross-navigation');
if(root){
 const nav=document.createElement('nav');
 nav.className='od-demo-nav';
 const inner=document.createElement('div');inner.className='od-demo-nav-inner';
 const heading=document.createElement('span');heading.className='od-demo-nav-label';
 const scroll=document.createElement('div');scroll.className='od-demo-nav-scroll';
 scroll.setAttribute('role','group');
 scroll.setAttribute('tabindex','0');
 nav.append(inner);inner.append(heading,scroll);root.replaceChildren(nav);
 const normalizedPath=location.pathname.endsWith('/')?location.pathname:location.pathname+'/';
 const current=pages.find(p=>p.path===normalizedPath)?.key||'explore';
 function language(){
  const code=new URLSearchParams(location.search).get('lang');
  return Object.hasOwn(labels,code)?code:Object.hasOwn(labels,document.documentElement.lang)?document.documentElement.lang:'es';
 }
 function render(){
  const lang=language(),t=labels[lang];
  heading.textContent=t.heading;nav.setAttribute('aria-label',t.heading);
  scroll.setAttribute('aria-label',t.heading);
  scroll.replaceChildren(...pages.map(item=>{
   const a=document.createElement('a');a.className='od-demo-nav-link';a.href=item.path+'?lang='+lang;
   a.textContent=t[item.key];if(item.key===current)a.setAttribute('aria-current','page');
   return a;
  }));
 }
 render();
 const activeLink=scroll.querySelector('[aria-current="page"]');
 if(activeLink)scroll.scrollLeft=Math.max(0,activeLink.offsetLeft-scroll.offsetLeft-12);
 // Existing demo language selectors mutate <html lang>; the shared nav follows
 // without monkey-patching history or adding a new locale store.
 const observer=new MutationObserver(()=>render());
 observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 window.addEventListener('popstate',render);
}
