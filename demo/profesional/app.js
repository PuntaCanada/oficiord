import {providers,regions,categories,jobs,initial,activeProvider,setProvider,toggleArea,matches,listJobs,suggestedQuote,saveOffer,markSimulated,discardOffer,openThread,mockReply} from './state.mjs';
const $=id=>document.getElementById(id);
const sharedCopy={"es":["Recorrido compartido cliente y profesional","La misma solicitud, oferta y conversación ficticia desde ambas perspectivas.","Explorar recorrido →"],"en":["Shared customer–professional walkthrough","One fictional request, quote and conversation from both perspectives.","Explore journey →"],"de":["Gemeinsamer Kunden-Handwerker-Ablauf","Derselbe fiktive Auftrag, dasselbe Angebot und derselbe Dialog aus beiden Perspektiven.","Gemeinsame Demo öffnen →"],"fr":["Parcours commun client–artisan","La même demande, le même devis et la même conversation fictive des deux côtés.","Explorer le parcours →"],"ht":["Menm parcours kliyan ak pwofesyonèl","Menm demann, òf ak mesaj envante nan de pespektiv yo.","Gade parcours la →"]};
const categoriesText={
es:{ac:'Aire acondicionado',plumbing:'Plomería',electric:'Electricidad',clean:'Limpieza',paint:'Pintura',appliance:'Electrodomésticos'},
en:{ac:'Air conditioning',plumbing:'Plumbing',electric:'Electricity',clean:'Cleaning',paint:'Painting',appliance:'Appliances'},
de:{ac:'Klimaanlagen',plumbing:'Sanitärarbeiten',electric:'Elektrik',clean:'Reinigung',paint:'Malerarbeiten',appliance:'Haushaltsgeräte'},
fr:{ac:'Climatisation',plumbing:'Plomberie',electric:'Électricité',clean:'Nettoyage',paint:'Peinture',appliance:'Électroménager'},
ht:{ac:'Èkondisyone',plumbing:'Plonbri',electric:'Elektrisite',clean:'Netwayaj',paint:'Penti',appliance:'Aparèy kay'}
};
const labels={
es:{eyebrow:'ÁREA PROFESIONAL · DEMO',headline:'Descubre trabajos ficticios. Organiza tus propuestas.',intro:'Explora cómo funcionará el futuro espacio para profesionales.',warning:'Todos los trabajos, perfiles, importes y mensajes son ficticios. No hay cuentas, ofertas ni comunicación real. Nada se envía ni se guarda.',back:'← Cuenta demo',more:'Más idiomas ▾',profileHeading:'Mi perfil de ejemplo',profileSelect:'Perfil ficticio',areasHeading:'Zonas de servicio',areasNote:'Selecciona en qué zonas trabajarías (solo en esta demo).',customerLink:'Vista del cliente',builderLink:'Crear trabajo ficticio',jobsHeading:'Trabajos compatibles de ejemplo',jobsIntro:'Solo trabajos cuya categoría y zona coinciden con tu perfil y cobertura seleccionada.',regionLabel:'Zona',categoryLabel:'Servicio',searchLabel:'Buscar',sortLabel:'Ordenar',allRegions:'Todas las zonas',allCategories:'Todos los servicios',searchPlaceholder:'Ej.: aire',sortNewest:'Orden original',sortRegion:'Por zona',sortCategory:'Por servicio',jobCount:'trabajos ficticios',jobsEmpty:'No hay trabajos de ejemplo con estos filtros. Prueba otra zona o perfil.',viewJob:'Preparar oferta ficticia',offersHeading:'Mis propuestas ficticias',offersNote:'Crea, consulta o retira propuestas simuladas. Nada se envía ni almacena.',offersEmpty:'Aún no has preparado una oferta ficticia.',editorTitle:'Preparar propuesta ficticia',amountLabel:'Importe ficticio (RD$)',amountNote:'Este importe no representa un precio de mercado.',saveOffer:'Guardar en demo',cancelOffer:'Cancelar',formError:'Introduce un importe entero de RD$ 500 a RD$ 100.000 para este trabajo ficticio.',draft:'Preparada en demo',selected:'Marcada como elegida en demo',mark:'Simular selección',discard:'Retirar',messagesHeading:'Mensajes ilustrativos',messagesNote:'Solo un diálogo preparado; ningún mensaje será enviado.',threadLabel:'Trabajo ficticio',threadWarning:'Las respuestas no se envían ni guardan.',replyOne:'Preguntar por la fecha',replyTwo:'Preguntar por detalles',msgCustomer:'Cliente ficticio',msgProvider:'Profesional ficticio',messageCustomer:'Hola, ¿puedes mirar este trabajo de ejemplo?',messageProvider:'¡Claro! Puedo preparar una propuesta ilustrativa.',responseOne:'¿Cuándo necesitarías este servicio en este ejemplo?',responseTwo:'¿Qué detalles adicionales incluiría este ejemplo?',days:'días ficticios',price:'Precio de ejemplo',footer:'OficioRD · Demostración sin cuentas ni contratación.'},
en:{eyebrow:'PROFESSIONAL AREA · DEMO',headline:'Discover sample jobs. Organize fictional proposals.',intro:'Preview how a professional workspace could work.',warning:'All jobs, profiles, amounts and messages are fictional. No real accounts, offers or communication. Nothing is sent or stored.',back:'← Account preview',more:'More languages ▾',profileHeading:'My sample profile',profileSelect:'Fictional profile',areasHeading:'Service areas',areasNote:'Choose where you would work in this demo only.',customerLink:'Customer preview',builderLink:'Create a fictional job',jobsHeading:'Matching fictional jobs',jobsIntro:'Only jobs matching your sample profile categories and chosen service areas.',regionLabel:'Area',categoryLabel:'Service',searchLabel:'Search',sortLabel:'Sort',allRegions:'All areas',allCategories:'All services',searchPlaceholder:'E.g. AC',sortNewest:'Original order',sortRegion:'By area',sortCategory:'By service',jobCount:'fictional jobs',jobsEmpty:'No matching jobs for these filters. Try another service area or profile.',viewJob:'Prepare fictional quote',offersHeading:'My fictional proposals',offersNote:'Prepare, view or withdraw offline demo proposals. Nothing is sent or saved.',offersEmpty:'No fictional quotes prepared yet.',editorTitle:'Prepare a fictional proposal',amountLabel:'Fictional amount (RD$)',amountNote:'This does not represent a market price.',saveOffer:'Save in demo',cancelOffer:'Cancel',formError:'Enter a whole-number sample amount from RD$ 500 to RD$ 100,000.',draft:'Prepared in demo',selected:'Marked selected in demo',mark:'Simulate selection',discard:'Remove',messagesHeading:'Example messages',messagesNote:'Only prewritten exchanges; no message is sent.',threadLabel:'Fictional job',threadWarning:'Replies are neither sent nor stored.',replyOne:'Ask about timing',replyTwo:'Ask for details',msgCustomer:'Fictional customer',msgProvider:'Fictional professional',messageCustomer:'Hello, could you review this example job?',messageProvider:'Sure! I can prepare an illustrative proposal.',responseOne:'When would you need this example service?',responseTwo:'What additional details would this example include?',days:'fictional days',price:'Example price',footer:'OficioRD · Preview without accounts or bookings.'},
de:{eyebrow:'HANDWERKERBEREICH · DEMO',headline:'Passende Aufträge entdecken. Beispielangebote verwalten.',intro:'So könnte der spätere Arbeitsbereich für Handwerker aussehen.',warning:'Alle Aufträge, Profile, Beträge und Nachrichten sind erfunden. Keine echten Konten, Angebote oder Kontakte. Nichts wird übertragen oder gespeichert.',back:'← Konto-Demo',more:'Weitere Sprachen ▾',profileHeading:'Mein Beispielprofil',profileSelect:'Fiktives Handwerkerprofil',areasHeading:'Einsatzgebiete',areasNote:'Wähle, in welchen Regionen du in dieser Demo tätig wärst.',customerLink:'Kundenbereich ansehen',builderLink:'Fiktiven Auftrag erstellen',jobsHeading:'Passende Beispielaufträge',jobsIntro:'Nur Aufträge, deren Dienstleistung und Region zu deinem Profil und deinen Einsatzgebieten passen.',regionLabel:'Region',categoryLabel:'Dienstleistung',searchLabel:'Suchen',sortLabel:'Sortierung',allRegions:'Alle Regionen',allCategories:'Alle Dienstleistungen',searchPlaceholder:'Z. B. Klimaanlage',sortNewest:'Ursprüngliche Reihenfolge',sortRegion:'Nach Region',sortCategory:'Nach Dienstleistung',jobCount:'fiktive Aufträge',jobsEmpty:'Keine passenden Beispielaufträge. Wähle andere Einsatzgebiete, Filter oder ein anderes Profil.',viewJob:'Beispielangebot vorbereiten',offersHeading:'Meine fiktiven Angebote',offersNote:'Angebote in der Demo vorbereiten, markieren oder zurücknehmen. Es wird nichts versendet oder gespeichert.',offersEmpty:'Noch keine fiktiven Angebote vorbereitet.',editorTitle:'Fiktives Angebot vorbereiten',amountLabel:'Fiktiver Betrag (RD$)',amountNote:'Der Betrag ist keine Marktpreisangabe.',saveOffer:'In Demo speichern',cancelOffer:'Abbrechen',formError:'Gib einen ganzzahligen Beispielbetrag zwischen RD$ 500 und RD$ 100.000 ein.',draft:'In der Demo vorbereitet',selected:'In der Demo als ausgewählt markiert',mark:'Auswahl simulieren',discard:'Entfernen',messagesHeading:'Simulierter Nachrichtenverlauf',messagesNote:'Nur vorgefertigte Dialoge; keine Nachricht wird versendet.',threadLabel:'Fiktiver Auftrag',threadWarning:'Antworten werden weder übertragen noch gespeichert.',replyOne:'Nach Termin fragen',replyTwo:'Nach Details fragen',msgCustomer:'Fiktiver Kunde',msgProvider:'Fiktiver Handwerker',messageCustomer:'Hallo, könntest du dir diesen Beispielauftrag ansehen?',messageProvider:'Gerne! Ich kann ein fiktives Angebot vorbereiten.',responseOne:'Wann wäre der Beispielauftrag zeitlich geplant?',responseTwo:'Welche weiteren Details würde der Beispielauftrag enthalten?',days:'fiktive Tage',price:'Beispielpreis',footer:'OficioRD · Demo ohne Konten oder Vermittlung.'},
fr:{eyebrow:'ESPACE PROFESSIONNEL · DÉMO',headline:'Trouvez des travaux fictifs. Gérez des devis imaginaires.',intro:'Aperçu du futur espace des professionnels.',warning:'Tous les travaux, profils, montants et messages sont fictifs. Aucun compte, devis ou échange réel. Rien n’est envoyé ni conservé.',back:'← Démo du compte',more:'Autres langues ▾',profileHeading:'Mon profil fictif',profileSelect:'Profil imaginaire',areasHeading:'Zones couvertes',areasNote:'Choisissez vos zones de service pour cette démonstration.',customerLink:'Espace client',builderLink:'Créer un travail fictif',jobsHeading:'Travaux fictifs correspondants',jobsIntro:'Uniquement les services et régions correspondant au profil et à vos zones.',regionLabel:'Zone',categoryLabel:'Service',searchLabel:'Recherche',sortLabel:'Trier',allRegions:'Toutes les zones',allCategories:'Tous les services',searchPlaceholder:'Ex. climatisation',sortNewest:'Ordre initial',sortRegion:'Par zone',sortCategory:'Par service',jobCount:'travaux fictifs',jobsEmpty:'Aucun travail fictif ne correspond. Changez les filtres ou les zones.',viewJob:'Préparer un devis fictif',offersHeading:'Mes devis fictifs',offersNote:'Préparez et retirez des devis pour cette démonstration. Rien n’est envoyé ou conservé.',offersEmpty:'Aucun devis fictif préparé.',editorTitle:'Préparer un devis fictif',amountLabel:'Montant fictif (RD$)',amountNote:'Ceci ne représente pas un prix de marché.',saveOffer:'Enregistrer dans la démo',cancelOffer:'Annuler',formError:'Saisissez un montant entier de RD$ 500 à RD$ 100 000.',draft:'Préparé dans la démo',selected:'Marqué choisi dans la démo',mark:'Simuler la sélection',discard:'Retirer',messagesHeading:'Messages illustratifs',messagesNote:'Uniquement des échanges préparés ; aucun envoi réel.',threadLabel:'Travail fictif',threadWarning:'Les réponses ne sont ni envoyées ni enregistrées.',replyOne:'Demander le délai',replyTwo:'Demander des détails',msgCustomer:'Client fictif',msgProvider:'Professionnel fictif',messageCustomer:'Bonjour, pourriez-vous examiner ces travaux fictifs ?',messageProvider:'Bien sûr ! Je peux préparer un devis imaginaire.',responseOne:'Quand faudrait-il effectuer ces travaux fictifs ?',responseTwo:'Quels détails supplémentaires inclure dans cet exemple ?',days:'jours fictifs',price:'Prix fictif',footer:'OficioRD · Démonstration sans inscription ni réservation.'},
ht:{eyebrow:'ESPAS PWOFESYONÈL · DEMO',headline:'Jwenn travay egzanp. Òganize òf envante.',intro:'Gade kijan espas pwofesyonèl la ta ka mache.',warning:'Tout travay, pwofil, pri ak mesaj yo envante. Pa gen kont ni òf ni kominikasyon reyèl. Nou pa voye oswa estoke anyen.',back:'← Demo kont',more:'Lòt lang ▾',profileHeading:'Pwofil egzanp mwen',profileSelect:'Pwofil envante',areasHeading:'Zòn sèvis',areasNote:'Chwazi zòn kote ou ta travay nan demonstrasyon sa a.',customerLink:'Espas kliyan',builderLink:'Kreye travay envante',jobsHeading:'Travay egzanp ki matche',jobsIntro:'Nou montre sèlman sèvis ak zòn ki matche ak pwofil ak zòn ou chwazi.',regionLabel:'Zòn',categoryLabel:'Sèvis',searchLabel:'Chèche',sortLabel:'Klase',allRegions:'Tout zòn',allCategories:'Tout sèvis',searchPlaceholder:'Eg. èkondisyone',sortNewest:'Lòd nòmal',sortRegion:'Dapre zòn',sortCategory:'Dapre sèvis',jobCount:'travay envante',jobsEmpty:'Pa gen travay egzanp ki matche. Chanje zòn oswa filtè yo.',viewJob:'Prepare òf envante',offersHeading:'Òf envante mwen',offersNote:'Prepare epi retire òf nan demo a sèlman. Nou pa voye oswa estoke anyen.',offersEmpty:'Ou poko prepare òf envante.',editorTitle:'Prepare òf envante',amountLabel:'Montan envante (RD$)',amountNote:'Sa a se pa pri mache a.',saveOffer:'Sove nan demo a',cancelOffer:'Anile',formError:'Antre yon montan antye ant RD$ 500 ak RD$ 100 000.',draft:'Prepare nan demo',selected:'Make kòm chwazi nan demo',mark:'Simile chwa',discard:'Retire',messagesHeading:'Mesaj egzanp',messagesNote:'Sèlman mesaj prepare; nou pa voye anyen.',threadLabel:'Travay envante',threadWarning:'Repons yo pa voye ni estoke.',replyOne:'Mande kilè',replyTwo:'Mande detay',msgCustomer:'Kliyan envante',msgProvider:'Pwofesyonèl envante',messageCustomer:'Bonjou, èske ou ka gade travay egzanp sa a?',messageProvider:'Wi! Mwen ka prepare yon òf envante.',responseOne:'Kilè ou ta bezwen sèvis egzanp sa a?',responseTwo:'Ki lòt detay ki ta nan egzanp sa a?',days:'jou envante',price:'Pri egzanp',footer:'OficioRD · Demo san kont ni kontra.'}
};
const photo={ac:'hvac',plumbing:'plumbing',electric:'electric',clean:'cleaning',paint:'cleaning',appliance:'appliances'};
const state=initial();
const requested=new URLSearchParams(location.search).get('lang');
let lang=Object.hasOwn(labels,requested)?requested:'es';
let editing=null;
const mk=(type,text,cls='')=>{const el=document.createElement(type);el.textContent=text??'';el.className=cls;return el;};
const option=(text,value)=>new Option(text,value);
const money=value=>'RD$ '+value.toLocaleString('en-US');
function refill(select,values,current){
 select.replaceChildren(...values.map(([label,value])=>option(label,value)));
 select.value=current;
}
function render(){
 const t=labels[lang],p=activeProvider(state);
 const copy=sharedCopy[lang];
 $('shared-title').textContent=copy[0];
 $('shared-subtitle').textContent=copy[1];
 $('shared-link').textContent=copy[2];
 $('shared-link').href='/demo/recorrido/?lang='+lang;
 document.documentElement.lang=lang;
 const names={eyebrow:t.eyebrow,headline:t.headline,intro:t.intro,warning:t.warning,back:t.back,'more-label':t.more,
  'profile-heading':t.profileHeading,'profile-select-label':t.profileSelect,'areas-heading':t.areasHeading,'areas-note':t.areasNote,
  'customer-link':t.customerLink,'builder-link':t.builderLink,'jobs-heading':t.jobsHeading,'jobs-intro':t.jobsIntro,
  'region-label':t.regionLabel,'category-label':t.categoryLabel,'search-label':t.searchLabel,'sort-label':t.sortLabel,
  'offers-heading':t.offersHeading,'offers-note':t.offersNote,'editor-title':t.editorTitle,'amount-label':t.amountLabel,
  'amount-note':t.amountNote,'save-offer':t.saveOffer,'cancel-offer':t.cancelOffer,
  'messages-heading':t.messagesHeading,'messages-note':t.messagesNote,'thread-label':t.threadLabel,
  'thread-warning':t.threadWarning,'reply-one':t.replyOne,'reply-two':t.replyTwo,footer:t.footer};
 for(const [id,text] of Object.entries(names))$(id).textContent=text;
 $('back').href='/account/?lang='+lang;
 $('customer-link').href='/demo/cliente/?lang='+lang;
 $('builder-link').href='/demo/crear/?lang='+lang;
 document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
 $('more-languages').open=false;
 refill($('provider'),providers.map(x=>[x.name,x.id]),state.providerId);
 $('profile-name').textContent=p.name;
 $('profile-image').src='/assets/oficiord-'+p.photo+'.webp';$('profile-image').alt=p.name+' · demo';
 $('profile-categories').textContent=p.cats.map(cat=>categoriesText[lang][cat]).join(' · ');
 $('areas').replaceChildren(...regions.map(area=>{
  const b=mk('button',area,'area');b.type='button';
  b.setAttribute('aria-pressed',String(state.areas.includes(area)));
  b.addEventListener('click',()=>{toggleArea(state,area);state.region='';editing=null;render();});
  return b;
 }));
 refill($('region'),[[t.allRegions,''],...regions.map(v=>[v,v])],state.region);
 refill($('category'),[[t.allCategories,''],...categories.map(v=>[categoriesText[lang][v],v])],state.category);
 refill($('sort'),[[t.sortNewest,'newest'],[t.sortRegion,'region'],[t.sortCategory,'category']],state.sort);
 $('search').value=state.search;
 renderJobs(t);
 renderOffers(t);
 renderMessages(t);
}
function renderJobs(t){
 const list=listJobs(state);
 $('job-count').textContent=list.length+' '+t.jobCount;
 $('jobs-empty').textContent=t.jobsEmpty;
 $('jobs-empty').hidden=list.length>0;
 $('jobs').replaceChildren(...list.map(job=>{
  const card=mk('article','','job');
  const img=mk('img');img.src='/assets/oficiord-'+photo[job.category]+'.webp';img.alt=job.title[lang]+' · demo';img.loading='lazy';
  const body=mk('div','','job-body');
  const title=mk('h3',job.title[lang]);const meta=mk('div',job.region+' · '+categoriesText[lang][job.category],'job-meta');
  const desc=mk('p',job.description[lang]);const tag=mk('span','DEMO','tag');
  const btn=mk('button',t.viewJob,'primary');btn.type='button';
  btn.addEventListener('click',()=>{
   editing=job.id;
   const quote=suggestedQuote(state,job.id);
   $('amount').value=state.offers[job.id]?.amount||quote?.amount||3500;
   renderEditor(t);
  });
  body.append(tag,title,meta,desc,btn);card.append(img,body);return card;
 }));
}
function renderOffers(t){
 const displayed=jobs.filter(job=>state.offers[job.id]&&matches(state,job));
 $('offers-empty').hidden=displayed.length>0;
 $('offers-empty').textContent=t.offersEmpty;
 $('offers').replaceChildren(...displayed.map(job=>{
  const quote=state.offers[job.id];
  const card=mk('article','','offer-card');
  const info=mk('div');
  info.append(mk('strong',job.title[lang]),mk('div',money(quote.amount),'offer-price'),
   mk('span',quote.phase==='selected'?t.selected:t.draft));
  const actions=mk('div','','offer-actions');
  if(quote.phase!=='selected'){
   const mark=mk('button',t.mark,'primary');mark.type='button';mark.addEventListener('click',()=>{markSimulated(state,job.id);render();});actions.append(mark);
  }
  const remove=mk('button',t.discard);remove.type='button';remove.addEventListener('click',()=>{discardOffer(state,job.id);render();});actions.append(remove);
  card.append(info,actions);return card;
 }));
 renderEditor(t);
}
function renderEditor(t){
 const job=jobs.find(j=>j.id===editing);
 $('offer-editor').hidden=!job||!matches(state,job);
 $('form-error').hidden=true;
 if(job)$('editor-job').textContent=job.title[lang]+' · '+job.region;
}
function bubble(name,text,who){
 const wrap=mk('div','','msg '+who);
 const el=mk('div','','bubble');el.append(mk('strong',name),mk('span',text));wrap.append(el);return wrap;
}
function renderMessages(t){
 const available=listJobs({...state,region:'',category:'',search:'',sort:'newest'});
 const current=available.find(job=>job.id===state.threadJob)||available[0]||null;
 state.threadJob=current?.id||null;
 refill($('thread-job'),available.map(job=>[job.title[lang],job.id]),state.threadJob||'');
 $('reply-one').disabled=!current;$('reply-two').disabled=!current;
 if(!current){$('thread').replaceChildren();return;}
 const messages=[bubble(t.msgCustomer,t.messageCustomer,'customer'),bubble(t.msgProvider,t.messageProvider,'pro')];
 if(state.reply>=0)messages.push(bubble(t.msgProvider,state.reply===0?t.responseOne:t.responseTwo,'pro'));
 $('thread').replaceChildren(...messages);
}
$('provider').addEventListener('change',()=>{setProvider(state,$('provider').value);editing=null;render();});
$('region').addEventListener('change',()=>{state.region=$('region').value;renderJobs(labels[lang]);});
$('category').addEventListener('change',()=>{state.category=$('category').value;renderJobs(labels[lang]);});
$('search').addEventListener('input',()=>{state.search=$('search').value;renderJobs(labels[lang]);});
$('sort').addEventListener('change',()=>{state.sort=$('sort').value;renderJobs(labels[lang]);});
$('cancel-offer').addEventListener('click',()=>{editing=null;renderEditor(labels[lang]);});
$('save-offer').addEventListener('click',()=>{
 if(!saveOffer(state,editing,Number($('amount').value))){
  $('form-error').hidden=false;$('form-error').textContent=labels[lang].formError;return;
 }
 editing=null;render();
});
$('thread-job').addEventListener('change',()=>{openThread(state,$('thread-job').value);renderMessages(labels[lang]);});
$('reply-one').addEventListener('click',()=>{mockReply(state,0);renderMessages(labels[lang]);});
$('reply-two').addEventListener('click',()=>{mockReply(state,1);renderMessages(labels[lang]);});
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{
 lang=b.dataset.lang;
 const u=new URL(location.href);u.searchParams.set('lang',lang);history.replaceState(null,'',u);render();
}));
render();
