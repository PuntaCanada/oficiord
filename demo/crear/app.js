import {regions,categories,validateDraft,exampleQuotes,chooseExampleQuote} from './engine.mjs';
const $=id=>document.getElementById(id);
const names={
 es:{ac:'Aire acondicionado',plumbing:'Plomería',electric:'Electricidad',clean:'Limpieza',paint:'Pintura',appliance:'Electrodomésticos'},
 en:{ac:'Air conditioning',plumbing:'Plumbing',electric:'Electrical',clean:'Cleaning',paint:'Painting',appliance:'Appliances'},
 de:{ac:'Klimaanlagen',plumbing:'Sanitärarbeiten',electric:'Elektroarbeiten',clean:'Reinigung',paint:'Malerarbeiten',appliance:'Haushaltsgeräte'},
 fr:{ac:'Climatisation',plumbing:'Plomberie',electric:'Électricité',clean:'Nettoyage',paint:'Peinture',appliance:'Électroménager'},
 ht:{ac:'Èkondisyone',plumbing:'Plonbri',electric:'Elektrisite',clean:'Netwayaj',paint:'Penti',appliance:'Aparèy kay'}
};
const langText={
 es:{eyebrow:'DEMOSTRACIÓN INTERACTIVA',headline:'Imagina tu trabajo. Compara opciones.',intro:'Describe una necesidad de ejemplo y descubre cómo podrás comparar profesionales de tu zona.',notice:'Solo demostración: no hay clientes, profesionales, precios, reservas o presupuestos reales. No introduzcas datos personales; nada se envía ni se guarda.',step1:'1. Describe',step2:'2. Compara',step3:'3. Decide',formTitle:'Crea un trabajo ficticio',category:'¿Qué servicio necesitas?',region:'¿Dónde?',title:'Título de ejemplo',description:'Detalles ficticios',urgency:'¿Para cuándo?',flexible:'Sin prisa',soon:'Próximos días',urgent:'Lo antes posible',continue:'Ver ofertas de ejemplo',error:'Elige un servicio y zona, y escribe un título (6–70 caracteres) y descripción ficticia (15–300 caracteres).',sort:'Ordenar',sortPrice:'Menor precio',sortHigh:'Mayor precio',sortTime:'Menor plazo',quotes:'Ofertas ilustrativas',compareNotice:'Los importes y plazos se han inventado para probar la comparación. No son estimaciones ni cotizaciones reales.',noMatch:'No hay perfiles de ejemplo para este servicio y zona. Modifica la zona o el servicio.',offer:'Oferta ficticia',days:'días de ejemplo',service:'Servicio',coverage:'Cobertura de ejemplo',see:'Elegir en la demo',back:'Editar descripción',resultTitle:'Tu elección de demostración',resultText:'Has seleccionado una opción ficticia. No se contrató a nadie, no se envió información y no se guardó ningún dato.',again:'Comparar otra vez',reset:'Nueva simulación',youCreated:'Tu solicitud imaginaria',missing:'No se han proporcionado datos personales ni enviado solicitudes.',noticeInline:"No compartas nombres, direcciones ni teléfonos reales.",offerChosen:"OFERTA FICTICIA",footer:'OficioRD · Vista previa sin funciones de registro ni contratación.',more:'Otros idiomas'},
 en:{eyebrow:'INTERACTIVE PREVIEW',headline:'Imagine a job. Compare your options.',intro:'Describe a fictional task and see how you could compare professionals in your area.',notice:'Demo only: no real customers, professionals, prices, bookings or quotes. Never enter personal details; nothing is sent or saved.',step1:'1. Describe',step2:'2. Compare',step3:'3. Choose',formTitle:'Create a fictional job',category:'What service do you need?',region:'Where?',title:'Example title',description:'Fictional details',urgency:'When?',flexible:'Flexible',soon:'In the coming days',urgent:'As soon as possible',continue:'View sample quotes',error:'Choose a service and area, then add a fictional title (6–70 characters) and description (15–300 characters).',sort:'Sort by',sortPrice:'Lowest price',sortHigh:'Highest price',sortTime:'Shortest timeframe',quotes:'Illustrative quotes',compareNotice:'Amounts and timeframes are invented for testing the comparison. Not real market estimates or quotes.',noMatch:'No example profiles match this service and area. Change the area or service.',offer:'Fictional quote',days:'example days',service:'Service',coverage:'Illustrative coverage',see:'Choose in demo',back:'Edit description',resultTitle:'Your demo choice',resultText:'You selected an imaginary option. Nobody was hired and nothing was sent or saved.',again:'Compare again',reset:'Start over',youCreated:'Your imaginary request',missing:'No personal information was requested or submitted.',noticeInline:"Do not enter real names, addresses or phone numbers.",offerChosen:"FICTIONAL QUOTE",footer:'OficioRD · Preview without registration or hiring.',more:'Other languages'},
 de:{eyebrow:'INTERAKTIVE DEMO',headline:'Auftrag beschreiben. Angebote vergleichen.',intro:'Beschreibe eine erfundene Aufgabe und entdecke, wie der spätere Vergleich regionaler Handwerker funktionieren kann.',notice:'Nur Demo: keine echten Kunden, Handwerker, Preise, Buchungen oder Angebote. Bitte keine persönlichen Daten eingeben. Nichts wird versendet oder gespeichert.',step1:'1. Beschreiben',step2:'2. Vergleichen',step3:'3. Auswählen',formTitle:'Fiktiven Auftrag erstellen',category:'Welche Dienstleistung?',region:'Wo wird Hilfe benötigt?',title:'Beispiel-Auftragstitel',description:'Fiktive Beschreibung',urgency:'Wie dringend?',flexible:'Zeitlich flexibel',soon:'In den nächsten Tagen',urgent:'So bald wie möglich',continue:'Beispielangebote ansehen',error:'Wähle Dienstleistung und Region und gib einen fiktiven Titel (6–70 Zeichen) sowie eine Beschreibung (15–300 Zeichen) ein.',sort:'Sortieren nach',sortPrice:'Günstigster Preis',sortHigh:'Höchster Preis',sortTime:'Kürzeste Dauer',quotes:'Fiktive Vergleichsangebote',compareNotice:'Alle Beträge und Zeitangaben sind ausschließlich für die Demo erfunden – keine echten Angebote oder Marktpreise.',noMatch:'Für diese Kombination gibt es kein Beispielprofil. Ändere Region oder Dienstleistung.',offer:'Fiktives Angebot',days:'Beispiel-Tage',service:'Leistung',coverage:'Beispiel-Einsatzgebiet',see:'In Demo auswählen',back:'Beschreibung bearbeiten',resultTitle:'Deine Demo-Auswahl',resultText:'Du hast eine erfundene Option ausgewählt. Niemand wurde beauftragt und es wurden keine Daten übertragen oder gespeichert.',again:'Erneut vergleichen',reset:'Neue Simulation',youCreated:'Dein erfundener Auftrag',missing:'Es wurden keine persönlichen Daten abgefragt oder übertragen.',noticeInline:"Keine echten Namen, Adressen oder Telefonnummern eingeben.",offerChosen:"FIKTIVES ANGEBOT",footer:'OficioRD · Vorschau ohne Registrierung oder Vermittlung.',more:'Weitere Sprachen'},
 fr:{eyebrow:'DÉMONSTRATION INTERACTIVE',headline:'Imaginez vos travaux. Comparez les offres.',intro:'Décrivez une mission fictive et découvrez comment comparer des professionnels de votre région.',notice:'Démonstration uniquement : aucun client, artisan, prix, réservation ou devis réel. Ne saisissez aucune donnée personnelle. Rien n’est envoyé ni enregistré.',step1:'1. Décrire',step2:'2. Comparer',step3:'3. Choisir',formTitle:'Créer une mission fictive',category:'Quel service ?',region:'Où ?',title:'Titre fictif',description:'Détails fictifs',urgency:'Pour quand ?',flexible:'Flexible',soon:'Prochains jours',urgent:'Dès que possible',continue:'Voir les devis fictifs',error:'Choisissez un service et une zone, puis un titre fictif (6–70 caractères) et une description (15–300 caractères).',sort:'Trier par',sortPrice:'Prix croissant',sortHigh:'Prix décroissant',sortTime:'Délai le plus court',quotes:'Devis illustratifs',compareNotice:'Les prix et délais sont inventés pour tester la comparaison. Ce ne sont pas des devis réels.',noMatch:'Aucun profil fictif ne correspond à ce service et cette zone. Modifiez votre sélection.',offer:'Devis fictif',days:'jours fictifs',service:'Service',coverage:'Zones illustratives',see:'Choisir pour la démo',back:'Modifier la description',resultTitle:'Votre choix fictif',resultText:'Vous avez choisi une option fictive. Personne n’a été engagé ; aucune donnée n’a été envoyée ni enregistrée.',again:'Comparer encore',reset:'Recommencer',youCreated:'Votre demande imaginaire',missing:'Aucune donnée personnelle collectée ou envoyée.',noticeInline:"Ne saisissez pas de noms, adresses ou numéros réels.",offerChosen:"DEVIS FICTIF",footer:'OficioRD · Prévisualisation sans inscription ni réservation.',more:'Autres langues'},
 ht:{eyebrow:'DEMONSTRASYON ENTÈRAKTIF',headline:'Imajine yon travay. Konpare opsyon yo.',intro:'Dekri yon travay envante epi wè kijan ou ta ka konpare pwofesyonèl nan zòn ou.',notice:'Se demonstrasyon sèlman: pa gen kliyan, pwofesyonèl, pri, rezèvasyon oswa òf reyèl. Pa mete enfòmasyon pèsonèl. Nou pa voye ni estoke anyen.',step1:'1. Dekri',step2:'2. Konpare',step3:'3. Chwazi',formTitle:'Kreye yon travay envante',category:'Ki sèvis ou bezwen?',region:'Nan ki zòn?',title:'Tit egzanp',description:'Detay envante',urgency:'Pou kilè?',flexible:'Pa prese',soon:'Nan jou k ap vini yo',urgent:'Pi vit posib',continue:'Gade òf egzanp',error:'Chwazi sèvis ak zòn, epi ekri yon tit envante (6–70 karaktè) ak deskripsyon (15–300 karaktè).',sort:'Klase pa',sortPrice:'Pri ki pi ba',sortHigh:'Pri ki pi wo',sortTime:'Tan ki pi kout',quotes:'Òf pou demonstrasyon',compareNotice:'Tout kantite ak delè yo envante pou konparezon. Se pa pri ni òf reyèl.',noMatch:'Pa gen pwofil egzanp pou sèvis ak zòn sa a. Chanje zòn oswa sèvis.',offer:'Òf envante',days:'jou egzanp',service:'Sèvis',coverage:'Zòn sèvis egzanp',see:'Chwazi nan demo a',back:'Modifye deskripsyon',resultTitle:'Chwa demonstrasyon ou',resultText:'Ou chwazi yon opsyon envante. Pa gen moun ki anboche, ni done ki voye oswa estoke.',again:'Konpare ankò',reset:'Rekòmanse',youCreated:'Demann envante ou',missing:'Nou pa mande ni voye okenn done pèsonèl.',noticeInline:"Pa mete non, adrès oswa nimewo telefòn reyèl.",offerChosen:"ÒF ENVANTE",footer:'OficioRD · Demo san enskripsyon ni kontra.',more:'Lòt lang'}
};
const requested=new URLSearchParams(location.search).get('lang');
let language=Object.hasOwn(langText,requested)?requested:'es';
let draft=null,chosen=null,sort='price',step=1;
const seed={title:'Revisión de aire acondicionado',description:'El equipo no enfría bien y necesita una revisión técnica de ejemplo. Esta descripción es totalmente ficticia.',category:'ac',region:'Higüey',urgency:'flexible'};
const readDraft=()=>({category:$('draft-category').value,region:$('draft-region').value,title:$('draft-title').value,description:$('draft-description').value,urgency:$('draft-urgency').value});
const node=(tag,text,cls='')=>{const e=document.createElement(tag);e.textContent=text;e.className=cls;return e;};
const makeOption=(label,value)=>new Option(label,value);
function renderLanguage(){
 const t=langText[language];document.documentElement.lang=language;
 for(const [key,value] of Object.entries(t)){
  const found=$('t-'+key);if(found)found.textContent=value;
 }
 for(const key of ['category','region','urgency']){
  const element=$('draft-'+key),value=element.value;
  const items=key==='category'?categories.map(x=>[names[language][x],x]):key==='region'?regions.map(x=>[x,x]):['flexible','soon','urgent'].map(value=>[t[value],value]);
  element.replaceChildren(...items.map(([label,v])=>makeOption(label,v)));
  element.value=value||seed[key];
 }
 const current=language;
 for(const button of document.querySelectorAll('[data-lang]'))button.setAttribute('aria-pressed',button.dataset.lang===current?'true':'false');
 $('more-languages').open=false;
 $('sort').replaceChildren(...[['price',t.sortPrice],['high',t.sortHigh],['time',t.sortTime]].map(([value,label])=>makeOption(label,value)));
 $('sort').value=sort;
 $('draft-title').placeholder=t.title;
 $('draft-description').placeholder=t.description;
 renderStep();
}
function renderStep(){
 const t=langText[language];
 for(const i of [1,2,3]){
  $('panel-'+i).hidden=step!==i;
  $('step-'+i).setAttribute('aria-current',step===i?'step':'false');
 }
 if(step===2)renderQuotes();
 if(step===3)renderChoice();
 if(draft){
  $('summary-title').textContent=draft.title;
  $('summary-meta').textContent=draft.region+' · '+names[language][draft.category]+' · '+t[draft.urgency];
  $('choice-job-title').textContent=draft.title;
  $('choice-job-meta').textContent=draft.region+' · '+names[language][draft.category];
 }
}
function updateDraft(){
 $('form-error').textContent='';
 $('preview-title').textContent=$('draft-title').value.trim()||langText[language].title;
 $('preview-meta').textContent=($('draft-region').value||'Higüey')+' · '+names[language][$('draft-category').value||'ac'];
 $('preview-photo').src='/assets/oficiord-'+({ac:'hvac',plumbing:'plumbing',electric:'electric',clean:'cleaning',paint:'cleaning',appliance:'appliances'}[$('draft-category').value]||'hvac')+'.webp';
}
function renderQuotes(){
 const t=langText[language],quotes=exampleQuotes(draft,sort),container=$('quote-list');
 $('quote-count').textContent=String(quotes.length);
 $('quote-empty').hidden=quotes.length!==0;
 $('quote-empty').textContent=t.noMatch;
 container.replaceChildren(...quotes.map(q=>{
  const card=node('article','','quote-card');
  const head=node('div','','quote-head');
  const img=document.createElement('img');img.src='/assets/oficiord-'+q.photo+'.webp';img.alt=t.offer;img.loading='lazy';img.width=70;img.height=70;
  const label=node('div','');
  label.append(node('strong',q.provider),node('small',q.area+' · '+t.offer,'subtle'));
  head.append(img,label);
  const price=node('div','RD$ '+q.amount.toLocaleString('en-US'),'quote-price');
  const facts=node('div',q.days+' '+t.days+' · '+t.service+': '+names[language][draft.category],'quote-facts');
  const areas=node('p',t.coverage+': '+q.areas.join(', '),'subtle');
  const button=node('button',t.see,'primary');button.type='button';button.addEventListener('click',()=>{chosen=chooseExampleQuote(draft,q.id);if(!chosen)return;step=3;renderStep();});
  card.append(head,price,facts,areas,button);
  return card;
 }));
}
function renderChoice(){
 const t=langText[language];if(!chosen)return;
 $('choice-provider').textContent=chosen.provider;
 $('choice-details').textContent='RD$ '+chosen.amount.toLocaleString('en-US')+' · '+chosen.days+' '+t.days;
 $('choice-photo').src='/assets/oficiord-'+chosen.photo+'.webp';
}
$('draft-next').addEventListener('click',()=>{
 const candidate=readDraft();
 if(!validateDraft(candidate)){$('form-error').textContent=langText[language].error;return;}
 draft=candidate;chosen=null;step=2;renderStep();$('wizard').scrollIntoView({block:'start',behavior:'smooth'});
});
$('back-edit').addEventListener('click',()=>{step=1;renderStep();});
$('back-compare').addEventListener('click',()=>{step=2;renderStep();});
$('reset-demo').addEventListener('click',()=>{
 chosen=null;draft=null;step=1;
 $('draft-title').value=seed.title;$('draft-description').value=seed.description;$('draft-category').value='ac';$('draft-region').value='Higüey';$('draft-urgency').value='flexible';
 renderStep();updateDraft();
});
$('sort').addEventListener('change',()=>{sort=$('sort').value;renderQuotes();});
for(const id of ['draft-category','draft-region','draft-urgency','draft-title','draft-description']){
 $(id).addEventListener('input',updateDraft);$(id).addEventListener('change',updateDraft);
}
for(const button of document.querySelectorAll('[data-lang]'))button.addEventListener('click',()=>{
 language=button.dataset.lang;
 const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);
 renderLanguage();updateDraft();
});
$('draft-title').value=seed.title;$('draft-description').value=seed.description;
renderLanguage();updateDraft();
