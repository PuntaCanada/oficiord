import {exampleJobs,makeInitialState,findJob,quotesFor,compatibleQuote,chooseJob,selectQuote,compareToggle,openConversation,simulateReply,resetJob} from './state.mjs';
const $=id=>document.getElementById(id);
const locale={
es:{eyebrow:'ÁREA DE CLIENTE · DEMOSTRACIÓN',headline:'Sigue tus trabajos, compara ofertas y explora mensajes ficticios.',intro:'Una vista previa de un panel para clientes, con datos totalmente inventados.',warning:'Todos los datos son ficticios, incluidos profesionales, precios y mensajes. No hay cuentas ni comunicación real. Nada se envía ni almacena.',myJobs:'Mis trabajos de ejemplo',builder:'Crear trabajo ficticio',market:'Explorar profesionales',back:'← Cuenta demo',more:'Más idiomas ▾',statusReview:'En revisión',statusQuotes:'Comparar ofertas',statusSelected:'Opción elegida',reset:'Reiniciar demo',quotes:'Ofertas ficticias',quotesNote:'Cantidades y plazos inventados para esta demo; no son cotizaciones ni disponibilidad reales.',sort:'Ordenar',price:'Precio menor',time:'Plazo menor',high:'Precio mayor',offers:'ofertas ficticias',compare:'Comparación rápida',compareHint:'Marca hasta tres ofertas para verlas juntas. Es solo una simulación.',compareButton:'Comparar',removeCompare:'Quitar comparación',choose:'Elegir en demo',selected:'Opción de ejemplo elegida. No se ha enviado ninguna solicitud ni contratado a nadie.',days:'días ficticios',cover:'Cobertura',noQuotes:'No hay ofertas ficticias compatibles.',messages:'Mensajes de ejemplo',messagesNote:'La conversación cambia según el perfil; las respuestas solo aparecen en esta página.',conversation:'Perfil de ejemplo',replyA:'Consultar plazo',replyB:'Consultar materiales',messageNote:'Mensajes ilustrativos predeterminados. No hay chat, teléfono ni contacto real.',customer:'Cliente ficticio',professional:'Profesional ficticio',msgOne:'Hola, hemos revisado tu solicitud de ejemplo. Podemos examinar el trabajo indicado.',msgTwo:'Gracias. ¿Qué necesitarías saber antes de comenzar?',replyTextA:'¿Cuándo podrías empezar en este ejemplo?',replyTextB:'¿Qué materiales incluiría este ejemplo?',footer:'OficioRD · Solo demostración; no se guardan datos.'},
en:{eyebrow:'CUSTOMER AREA · PREVIEW',headline:'Track jobs, compare quotes and explore imaginary messages.',intro:'A preview of a customer dashboard using entirely fictional examples.',warning:'All data is fictional, including professionals, prices and messages. No real accounts or communication. Nothing is sent or saved.',myJobs:'My sample jobs',builder:'Create a fictional job',market:'Explore professionals',back:'← Account demo',more:'More languages ▾',statusReview:'Under review',statusQuotes:'Compare quotes',statusSelected:'Option selected',reset:'Reset preview',quotes:'Fictional quotes',quotesNote:'Invented amounts and timeframes for this demo, not actual offers or availability.',sort:'Sort',price:'Lowest price',time:'Shortest time',high:'Highest price',offers:'fictional quotes',compare:'Quick comparison',compareHint:'Select up to three fictional offers to see them side by side.',compareButton:'Compare',removeCompare:'Remove',choose:'Select in demo',selected:'An example option was chosen. Nobody was hired and no request was sent.',days:'fictional days',cover:'Example coverage',noQuotes:'No matching fictional offers.',messages:'Example messages',messagesNote:'The conversation changes by example professional; replies appear only on this page.',conversation:'Example professional',replyA:'Ask about timing',replyB:'Ask about materials',messageNote:'Canned illustrative messages only. No real chat, phone number or contact.',customer:'Fictional customer',professional:'Fictional professional',msgOne:'Hello! We reviewed your sample request. We could inspect the work described.',msgTwo:'Thanks. What would you need to know before we begin?',replyTextA:'When could you start in this example?',replyTextB:'What materials would this example include?',footer:'OficioRD · Preview only, no data is saved.'},
de:{eyebrow:'KUNDENBEREICH · DEMO',headline:'Aufträge im Blick, Angebote im Vergleich, Nachrichten als Vorschau.',intro:'So könnte der spätere Kundenbereich aussehen – mit vollständig erfundenen Beispielen.',warning:'Alle Aufträge, Handwerker, Preise und Nachrichten sind fiktiv. Es gibt keine echten Konten oder Kommunikation. Nichts wird versendet oder gespeichert.',myJobs:'Meine Beispielaufträge',builder:'Fiktiven Auftrag erstellen',market:'Handwerker entdecken',back:'← Konto-Demo',more:'Weitere Sprachen ▾',statusReview:'In Prüfung',statusQuotes:'Angebote vergleichen',statusSelected:'Option ausgewählt',reset:'Demo zurücksetzen',quotes:'Fiktive Angebote',quotesNote:'Beträge und Zeitangaben sind erfunden – keine realen Angebote oder Verfügbarkeiten.',sort:'Sortieren',price:'Günstigster Preis',time:'Kürzeste Dauer',high:'Höchster Preis',offers:'fiktive Angebote',compare:'Direktvergleich',compareHint:'Bis zu drei Beispielangebote auswählen und nebeneinander vergleichen.',compareButton:'Vergleichen',removeCompare:'Entfernen',choose:'In Demo auswählen',selected:'Eine fiktive Option wurde ausgewählt. Niemand wurde beauftragt und nichts versendet.',days:'fiktive Tage',cover:'Beispiel-Einsatzgebiet',noQuotes:'Keine passenden fiktiven Angebote vorhanden.',messages:'Simulierter Nachrichtenverlauf',messagesNote:'Wechsle zwischen Beispielhandwerkern. Antworten erscheinen ausschließlich hier auf der Seite.',conversation:'Beispielhandwerker',replyA:'Nach Termin fragen',replyB:'Nach Material fragen',messageNote:'Nur vorgefertigte Beispielnachrichten. Kein echter Chat, keine Telefonnummern oder Kontakte.',customer:'Fiktiver Kunde',professional:'Fiktiver Handwerker',msgOne:'Hallo! Wir haben deinen Beispielauftrag angesehen und könnten die Arbeiten prüfen.',msgTwo:'Danke! Was möchtest du vorab wissen?',replyTextA:'Wann könntest du in diesem Beispiel anfangen?',replyTextB:'Welches Material wäre in diesem Beispiel enthalten?',footer:'OficioRD · Nur Demo, keine Datenspeicherung.'},
fr:{eyebrow:'ESPACE CLIENT · DÉMONSTRATION',headline:'Suivez des travaux, comparez des devis et explorez des messages fictifs.',intro:'Un aperçu de l’espace client, avec des exemples entièrement imaginaires.',warning:'Travaux, artisans, prix et messages sont fictifs. Aucun compte ni échange réel. Rien n’est envoyé ou enregistré.',myJobs:'Mes travaux fictifs',builder:'Créer un travail fictif',market:'Explorer les professionnels',back:'← Démo du compte',more:'Autres langues ▾',statusReview:'En révision',statusQuotes:'Comparer les devis',statusSelected:'Option choisie',reset:'Réinitialiser',quotes:'Devis fictifs',quotesNote:'Montants et délais inventés ; ni offres ni disponibilités réelles.',sort:'Trier',price:'Prix croissant',time:'Délai court',high:'Prix décroissant',offers:'devis fictifs',compare:'Comparaison rapide',compareHint:'Choisissez jusqu’à trois devis fictifs à comparer côte à côte.',compareButton:'Comparer',removeCompare:'Retirer',choose:'Choisir pour la démo',selected:'Option fictive choisie. Aucun artisan engagé et aucune demande envoyée.',days:'jours fictifs',cover:'Zone fictive',noQuotes:'Aucun devis fictif compatible.',messages:'Messages fictifs',messagesNote:'La conversation change selon le profil ; les réponses restent sur cette page.',conversation:'Professionnel fictif',replyA:'Demander le délai',replyB:'Demander les matériaux',messageNote:'Messages pré-écrits fictifs. Aucun chat ni contact réel.',customer:'Client fictif',professional:'Artisan fictif',msgOne:'Bonjour ! Nous avons étudié votre demande fictive et pouvons examiner les travaux.',msgTwo:'Merci ! Que souhaitez-vous savoir avant de commencer ?',replyTextA:'Quand pourriez-vous commencer dans cet exemple ?',replyTextB:'Quels matériaux seraient compris dans cet exemple ?',footer:'OficioRD · Démonstration sans stockage de données.'},
ht:{eyebrow:'ESPAS KLIYAN · DEMO',headline:'Swiv travay, konpare òf, epi gade mesaj envante.',intro:'Men yon egzanp espas kliyan ak enfòmasyon ki pa reyèl.',warning:'Tout travay, pwofesyonèl, pri ak mesaj yo envante. Pa gen kont ni kominikasyon reyèl. Anyen pa voye oswa estoke.',myJobs:'Travay egzanp mwen',builder:'Kreye travay envante',market:'Gade pwofesyonèl',back:'← Demo kont',more:'Lòt lang ▾',statusReview:'Anba revizyon',statusQuotes:'Konpare òf yo',statusSelected:'Opsyon chwazi',reset:'Rekòmanse demo a',quotes:'Òf envante',quotesNote:'Tout kantite ak delè yo envante; pa gen òf ni disponiblite reyèl.',sort:'Klase',price:'Pi ba pri',time:'Pi kout delè',high:'Pi wo pri',offers:'òf envante',compare:'Konpare rapid',compareHint:'Chwazi jiska twa òf envante pou konpare yo.',compareButton:'Konpare',removeCompare:'Retire',choose:'Chwazi nan demo',selected:'Ou chwazi yon opsyon envante. Pa gen moun ki anboche ni demann ki voye.',days:'jou envante',cover:'Zòn sèvis egzanp',noQuotes:'Pa gen òf envante ki matche.',messages:'Mesaj egzanp',messagesNote:'Konvèsasyon an chanje selon pwofil la; repons yo parèt sèlman sou paj sa a.',conversation:'Pwofesyonèl egzanp',replyA:'Mande kilè',replyB:'Mande sou materyèl',messageNote:'Mesaj egzanp sèlman. Pa gen chat ni kontak reyèl.',customer:'Kliyan envante',professional:'Pwofesyonèl envante',msgOne:'Bonjou! Nou te wè demann egzanp ou a epi nou ta ka gade travay la.',msgTwo:'Mèsi! Ki sa ou ta vle konnen anvan nou kòmanse?',replyTextA:'Kilè ou ta ka kòmanse nan egzanp sa a?',replyTextB:'Ki materyèl ki ta ladan l nan egzanp sa a?',footer:'OficioRD · Demo sèlman; pa gen done ki estoke.'}
};
const photoByCategory={ac:'hvac',plumbing:'plumbing',electric:'electric',clean:'cleaning',paint:'cleaning',appliance:'appliances'};
const state=makeInitialState();
const params=new URLSearchParams(location.search);
let lang=Object.hasOwn(locale,params.get('lang'))?params.get('lang'):'es';
let sort='price';
const create=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const formatMoney=amount=>'RD$ '+amount.toLocaleString('en-US');
function render(){
 const t=locale[lang],job=findJob(state.jobId),quotes=quotesFor(job.id,sort);
 document.documentElement.lang=lang;
 const staticLabels={
  eyebrow:t.eyebrow,headline:t.headline,intro:t.intro,warning:t.warning,'my-jobs':t.myJobs,
  'build-demo':t.builder,'marketplace-demo':t.market,back:t.back,'more-label':t.more,
  reset:t.reset,'quotes-title':t.quotes,'quotes-note':t.quotesNote,
  'sort-label':t.sort,'comparison-title':t.compare,'comparison-hint':t.compareHint,
  'messages-title':t.messages,'messages-note':t.messagesNote,'conversation-label':t.conversation,
  'message-disclaimer':t.messageNote,footer:t.footer,'reply-a':t.replyA,'reply-b':t.replyB
 };
 for(const [id,label] of Object.entries(staticLabels))$(id).textContent=label;
 $('back').href='/account/?lang='+lang;
 $('build-demo').href='/demo/crear/?lang='+lang;
 $('marketplace-demo').href='/demo/?lang='+lang;
 document.querySelectorAll('[data-lang]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lang===lang)));
 $('other-languages').open=false;
 for(const [idx,id] of ['job-one','job-two'].entries()){
  const button=$(id),sample=exampleJobs[idx];
  button.replaceChildren(create('strong','',sample.title[lang]),create('small','',sample.region));
  button.setAttribute('aria-pressed',String(sample.id===job.id));
 }
 $('job-title').textContent=job.title[lang];
 $('job-subtitle').textContent=job.region+' · '+job.category.toUpperCase();
 $('job-description').textContent=job.description[lang];
 $('job-photo').src='/assets/oficiord-'+photoByCategory[job.category]+'.webp';
 $('job-photo').alt=job.title[lang]+' · demo';
 $('status-pill').textContent=state.status==='selected'?t.statusSelected:t.statusQuotes;
 for(const [i,key] of ['review','quotes','selected'].entries()){
  const el=$('status-'+key);
  el.textContent=t['status'+key[0].toUpperCase()+key.slice(1)];
  el.dataset.active=String(state.status===key);
  el.dataset.complete=String(['review','quotes','selected'].indexOf(state.status)>i);
 }
 const opts=[['price',t.price],['time',t.time],['high',t.high]];
 $('sort').replaceChildren(...opts.map(([value,label])=>new Option(label,value)));
 $('sort').value=sort;
 $('quote-count').textContent=quotes.length+' '+t.offers;
 $('no-quotes').textContent=t.noQuotes;$('no-quotes').hidden=quotes.length!==0;
 $('quote-list').replaceChildren(...quotes.map(quote=>renderQuote(quote,t)));
 renderComparison(t);
 $('selected-note').hidden=!state.selectedQuote;
 $('selected-note').textContent=t.selected;
 const previous=state.conversationQuote;
 $('conversation').replaceChildren(...quotes.map(q=>new Option(q.provider,q.id)));
 const valid=quotes.find(x=>x.id===previous)||quotes[0]||null;
 $('conversation').value=valid?.id||'';
 state.conversationQuote=valid?.id||null;
 if(valid?.id!==previous)state.replyIndex=-1;
 renderMessages(t);
}
function renderQuote(q,t){
 const card=create('article','quote'+(state.selectedQuote===q.id?' selected':''));
 const header=create('div','quote-top');
 const photo=create('img');photo.src='/assets/oficiord-'+q.photo+'.webp';photo.alt=t.professional+' · demo';photo.loading='lazy';
 const identity=create('div');
 identity.append(create('strong','',q.provider),create('small','',q.area));
 header.append(photo,identity);
 const price=create('div','price',formatMoney(q.amount));
 const meta=create('div','quote-meta',q.days+' '+t.days+' · '+t.cover+': '+q.areas.join(', '));
 const actions=create('div','quote-actions');
 const compare=create('button','secondary',state.compareIds.includes(q.id)?t.removeCompare:t.compareButton);
 compare.type='button';compare.setAttribute('aria-pressed',String(state.compareIds.includes(q.id)));
 compare.addEventListener('click',()=>{compareToggle(state,q.id);render();});
 const choose=create('button','primary',t.choose);choose.type='button';
 choose.addEventListener('click',()=>{selectQuote(state,q.id);render();});
 actions.append(compare,choose);card.append(header,price,meta,actions);return card;
}
function renderComparison(t){
 const chosen=state.compareIds.map(id=>compatibleQuote(state.jobId,id)).filter(Boolean);
 $('comparison-list').replaceChildren(...chosen.map(q=>{
  const col=create('div','compare-column');
  col.append(create('strong','',q.provider),create('span','',formatMoney(q.amount)),create('span','',q.days+' '+t.days),create('span','',q.area));
  return col;
 }));
 $('comparison-hint').hidden=chosen.length!==0;
}
function message(author,body,customer){
 const row=create('div','message-row'+(customer?' from-customer':''));
 row.append(create('span','avatar',customer?'K':'P'));
 const bubble=create('div','bubble');
 bubble.append(create('strong','',author),create('span','',body));
 row.append(bubble);return row;
}
function renderMessages(t){
 const selected=compatibleQuote(state.jobId,state.conversationQuote);
 $('reply-a').disabled=!selected;$('reply-b').disabled=!selected;
 if(!selected){$('message-list').replaceChildren();return;}
 const thread=[message(t.professional,t.msgOne,false),message(t.customer,t.msgTwo,true)];
 if(state.replyIndex>=0)thread.push(message(t.customer,state.replyIndex===0?t.replyTextA:t.replyTextB,true));
 $('message-list').replaceChildren(...thread);
}
$('job-one').addEventListener('click',()=>{chooseJob(state,exampleJobs[0].id);render();});
$('job-two').addEventListener('click',()=>{chooseJob(state,exampleJobs[1].id);render();});
$('reset').addEventListener('click',()=>{resetJob(state);sort='price';render();});
$('sort').addEventListener('change',()=>{sort=$('sort').value;render();});
$('conversation').addEventListener('change',()=>{openConversation(state,$('conversation').value);render();});
$('reply-a').addEventListener('click',()=>{simulateReply(state,0);renderMessages(locale[lang]);});
$('reply-b').addEventListener('click',()=>{simulateReply(state,1);renderMessages(locale[lang]);});
document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>{
 lang=button.dataset.lang;
 const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);
 render();
}));
render();
