/* OficioRD UI localization – Spanish is canonical; user content is never machine-translated.
 * Language selection is a presentation preference, not a change to DB category values.
 */
(()=>{
 const languages={es:"🇩🇴 Español",en:"🇺🇸 English",de:"🇩🇪 Deutsch",fr:"🇫🇷 Français",ht:"🇭🇹 Kreyòl ayisyen"};
 const strings={
 "Explorar trabajos":{en:"Browse jobs",de:"Aufträge ansehen",fr:"Voir les missions",ht:"Gade travay yo"},
 "HECHO PARA REPÚBLICA DOMINICANA 🇩🇴":{en:"MADE FOR THE DOMINICAN REPUBLIC 🇩🇴",de:"FÜR DIE DOMINIKANISCHE REPUBLIK 🇩🇴",fr:"CONÇU POUR LA RÉPUBLIQUE DOMINICAINE 🇩🇴",ht:"FÈ POU REPIBLIK DOMINIKÈN 🇩🇴"},
 "El trabajo que necesitas. La gente que sabe hacerlo.":{en:"The work you need. People who know how to do it.",de:"Dein Auftrag. Die passenden Fachleute.",fr:"Vos travaux. Les professionnels qu’il vous faut.",ht:"Travay ou bezwen an. Moun ki konn fè l."},
 "Encuentra técnicos, profesionales y proveedores de servicios cerca de ti. Empezamos por Higüey, Bávaro y Punta Cana.":{en:"Find technicians and service professionals near you. Starting in Higüey, Bávaro and Punta Cana.",de:"Finde Handwerker und Dienstleister in deiner Nähe. Wir starten in Higüey, Bávaro und Punta Cana.",fr:"Trouvez des artisans et prestataires près de chez vous. Nous commençons à Higüey, Bávaro et Punta Cana.",ht:"Jwenn teknisyen ak pwofesyonèl sèvis toupre w. Nou kòmanse nan Higüey, Bávaro ak Punta Cana."},
 "Publicar un trabajo":{en:"Post a job",de:"Auftrag einstellen",fr:"Publier une mission",ht:"Pibliye yon travay"},
 "Soy profesional":{en:"I'm a professional",de:"Ich bin Dienstleister",fr:"Je suis professionnel",ht:"Mwen se yon pwofesyonèl"},
 "¿Qué necesitas resolver?":{en:"What do you need done?",de:"Was muss erledigt werden?",fr:"De quel service avez-vous besoin ?",ht:"Ki travay ou bezwen fè?"},
 "Servicios para casas, negocios y alojamientos.":{en:"Services for homes, businesses and rentals.",de:"Dienstleistungen für Haushalte, Unternehmen und Unterkünfte.",fr:"Services pour maisons, commerces et hébergements.",ht:"Sèvis pou kay, biznis ak kote moun rete."},
 "Trabajos en tu zona":{en:"Jobs in your area",de:"Aufträge in deiner Region",fr:"Missions dans votre région",ht:"Travay nan zòn ou"},
 "Solo aparecen solicitudes aprobadas por moderación.":{en:"Only moderator-approved listings are shown.",de:"Es werden nur geprüfte und freigegebene Anzeigen angezeigt.",fr:"Seules les annonces approuvées par la modération sont affichées.",ht:"Se sèlman anons moderatè yo apwouve ki parèt."},
 "Todas las zonas":{en:"All areas",de:"Alle Regionen",fr:"Toutes les zones",ht:"Tout zòn yo"},
 "Todos los servicios":{en:"All services",de:"Alle Dienstleistungen",fr:"Tous les services",ht:"Tout sèvis yo"},
 "Buscar":{en:"Search",de:"Suchen",fr:"Rechercher",ht:"Chèche"},
 "Proyecto piloto:":{en:"Pilot project:",de:"Pilotprojekt:",fr:"Projet pilote :",ht:"Pwojè pilòt:"},
 "el contacto directo, las cuentas y las propuestas todavía no están disponibles. No realices pagos a desconocidos ni compartas información sensible.":{en:"Direct contact, accounts and proposals are not available yet. Do not pay strangers or share sensitive information.",de:"Direktkontakt, Konten und Angebote sind noch nicht verfügbar. Zahle nichts an Unbekannte und teile keine sensiblen Daten.",fr:"Les contacts directs, comptes et devis ne sont pas encore disponibles. N'envoyez pas d'argent à des inconnus et ne partagez pas de données sensibles.",ht:"Kontak dirèk, kont ak òf poko disponib. Pa voye lajan bay moun ou pa konnen ni pataje enfòmasyon sansib."},
 "Versión piloto.":{en:"Pilot version.",de:"Testversion.",fr:"Version pilote.",ht:"Vèsyon pilòt."},
 "Proyecto independiente · No afiliado a MyHammer.":{en:"Independent project · Not affiliated with MyHammer.",de:"Unabhängiges Projekt · Nicht mit MyHammer verbunden.",fr:"Projet indépendant · Sans lien avec MyHammer.",ht:"Pwojè endepandan · Pa gen lyen ak MyHammer."},
 "Nueva solicitud":{en:"New request",de:"Neue Anfrage",fr:"Nouvelle demande",ht:"Nouvo demann"},
 "Durante la etapa piloto, toda solicitud requiere revisión antes de publicarse.":{en:"During the pilot, every request must be reviewed before publication.",de:"Während des Testbetriebs muss jede Anfrage vor der Veröffentlichung geprüft werden.",fr:"Pendant la phase pilote, chaque demande est vérifiée avant publication.",ht:"Pandan faz pilòt la, yo dwe verifye chak demann anvan yo pibliye l."},
 "Título":{en:"Title",de:"Titel",fr:"Titre",ht:"Tit"},
 "Zona":{en:"Area",de:"Region",fr:"Zone",ht:"Zòn"},
 "Categoría":{en:"Category",de:"Kategorie",fr:"Catégorie",ht:"Kategori"},
 "Descripción (sin teléfonos ni direcciones)":{en:"Description (no phone numbers or addresses)",de:"Beschreibung (keine Telefonnummern oder Adressen)",fr:"Description (sans téléphone ni adresse)",ht:"Deskripsyon (san nimewo telefòn oswa adrès)"},
 "Correo electrónico (privado)":{en:"Email address (private)",de:"E-Mail-Adresse (privat)",fr:"Adresse e-mail (privée)",ht:"Adrès imèl (prive)"},
 "Acepto el tratamiento de mis datos para gestionar esta solicitud.":{en:"I agree to the processing of my data to handle this request.",de:"Ich stimme der Verarbeitung meiner Daten zur Bearbeitung dieser Anfrage zu.",fr:"J’accepte le traitement de mes données pour gérer cette demande.",ht:"Mwen dakò pou yo trete done mwen pou jere demann sa a."},
 "Enviar para revisión":{en:"Submit for review",de:"Zur Prüfung senden",fr:"Envoyer pour vérification",ht:"Voye pou verifikasyon"},
 "Reportar un anuncio":{en:"Report a listing",de:"Anzeige melden",fr:"Signaler une annonce",ht:"Rapòte yon anons"},
 "Las denuncias son revisadas por una persona. No compartas datos personales en la descripción.":{en:"Reports are reviewed by a person. Do not include personal information in the description.",de:"Meldungen werden von einer Person geprüft. Gib in der Beschreibung keine personenbezogenen Daten an.",fr:"Les signalements sont examinés par une personne. N'incluez aucune donnée personnelle.",ht:"Yon moun ap verifye rapò yo. Pa mete enfòmasyon pèsonèl nan deskripsyon an."},
 "Motivo":{en:"Reason",de:"Grund",fr:"Motif",ht:"Rezon"},
 "Spam o publicidad":{en:"Spam or advertising",de:"Spam oder Werbung",fr:"Spam ou publicité",ht:"Spam oswa piblisite"},
 "Posible estafa":{en:"Possible fraud",de:"Möglicher Betrug",fr:"Escroquerie possible",ht:"Posib fwod"},
 "Contenido inapropiado":{en:"Inappropriate content",de:"Unangemessener Inhalt",fr:"Contenu inapproprié",ht:"Kontni ki pa apwopriye"},
 "Datos personales expuestos":{en:"Personal information exposed",de:"Offengelegte persönliche Daten",fr:"Données personnelles exposées",ht:"Done pèsonèl ki ekspoze"},
 "Otro problema":{en:"Other problem",de:"Anderes Problem",fr:"Autre problème",ht:"Lòt pwoblèm"},
 "Detalles (opcional)":{en:"Details (optional)",de:"Details (optional)",fr:"Détails (facultatif)",ht:"Detay (si ou vle)"},
 "Entiendo que la información será revisada para gestionar mi reporte.":{en:"I understand this information will be reviewed to handle my report.",de:"Ich verstehe, dass diese Informationen zur Bearbeitung meiner Meldung geprüft werden.",fr:"Je comprends que ces informations seront examinées pour traiter mon signalement.",ht:"Mwen konprann y ap verifye enfòmasyon sa yo pou trete rapò mwen."},
 "Enviar reporte":{en:"Submit report",de:"Meldung senden",fr:"Envoyer le signalement",ht:"Voye rapò a"},
 "Plomería":{en:"Plumbing",de:"Sanitär / Klempner",fr:"Plomberie",ht:"Plonbri"},
 "Electricidad":{en:"Electrical work",de:"Elektroarbeiten",fr:"Électricité",ht:"Elektrisite"},
 "Aire acondicionado":{en:"Air conditioning",de:"Klimaanlagen",fr:"Climatisation",ht:"Èkondisyone"},
 "Reparación de electrodomésticos":{en:"Appliance repairs",de:"Haushaltsgeräte-Reparatur",fr:"Réparation d’électroménager",ht:"Reparasyon aparèy kay"},
 "Pintura":{en:"Painting",de:"Malerarbeiten",fr:"Peinture",ht:"Penti"},
 "Limpieza":{en:"Cleaning",de:"Reinigung",fr:"Nettoyage",ht:"Netwayaj"},
 "Carpintería":{en:"Carpentry",de:"Tischlerarbeiten",fr:"Menuiserie",ht:"Chapant"},
 "Otros":{en:"Other",de:"Sonstiges",fr:"Autres",ht:"Lòt"},
 "Fugas y tuberías":{en:"Leaks and pipes",de:"Lecks und Rohrleitungen",fr:"Fuites et tuyauterie",ht:"Fuit ak tiyo"},
 "Instalaciones y reparaciones":{en:"Installations and repairs",de:"Installation und Reparatur",fr:"Installation et réparation",ht:"Enstalasyon ak reparasyon"},
 "Instalación y mantenimiento":{en:"Installation and maintenance",de:"Installation und Wartung",fr:"Installation et entretien",ht:"Enstalasyon ak antretyen"},
 "Neveras, lavadoras y más":{en:"Fridges, washing machines and more",de:"Kühlschränke, Waschmaschinen und mehr",fr:"Réfrigérateurs, lave-linge et plus",ht:"Frijidè, machin lave ak lòt ankò"},
 "Paredes y fachadas":{en:"Walls and façades",de:"Wände und Fassaden",fr:"Murs et façades",ht:"Mi ak fasad"},
 "Hogares y alojamientos":{en:"Homes and rentals",de:"Haushalte und Unterkünfte",fr:"Logements et hébergements",ht:"Kay ak kote moun rete"},
 "Muebles y reparaciones":{en:"Furniture and repairs",de:"Möbel und Reparaturen",fr:"Meubles et réparations",ht:"Mèb ak reparasyon"},
 "Servicios adicionales":{en:"Additional services",de:"Weitere Dienstleistungen",fr:"Services supplémentaires",ht:"Lòt sèvis"},
 "Selecciona una zona":{en:"Select an area",de:"Region auswählen",fr:"Choisir une zone",ht:"Chwazi yon zòn"},
 "Selecciona un servicio":{en:"Select a service",de:"Dienstleistung auswählen",fr:"Choisir un service",ht:"Chwazi yon sèvis"},
 "Todavía no hay trabajos aprobados para estos filtros.":{en:"No approved jobs match these filters yet.",de:"Für diese Filter sind noch keine Aufträge freigegeben.",fr:"Aucune mission approuvée ne correspond encore à ces filtres.",ht:"Poko gen travay apwouve pou filtè sa yo."},
 "El tablón está pendiente de configurar. Todavía no se aceptan solicitudes.":{en:"The listings board is being set up. Requests are not accepted yet.",de:"Die Auftragsbörse wird noch eingerichtet. Anfragen werden noch nicht angenommen.",fr:"Le tableau d’annonces est en préparation. Les demandes ne sont pas encore acceptées.",ht:"Nou poko fin prepare lis anons yo. Nou poko aksepte demann."},
 "Publicar un trabajo":{en:"Post a job",de:"Auftrag einstellen",fr:"Publier une mission",ht:"Pibliye yon travay"},
 "Crear perfil profesional":{en:"Create professional profile",de:"Dienstleisterprofil erstellen",fr:"Créer un profil professionnel",ht:"Kreye pwofil pwofesyonèl"},
 "Comprobando disponibilidad…":{en:"Checking availability…",de:"Verfügbarkeit wird geprüft …",fr:"Vérification de la disponibilité…",ht:"N ap verifye disponiblite…"},
 "Registro temporalmente cerrado durante la preparación legal y de seguridad. No envíes datos personales todavía.":{en:"Registration is temporarily closed while legal and safety preparations are completed. Do not submit personal data yet.",de:"Die Registrierung bleibt während der rechtlichen und technischen Vorbereitung geschlossen. Bitte noch keine persönlichen Daten eingeben.",fr:"Les inscriptions sont temporairement fermées pendant les préparatifs juridiques et de sécurité. Ne transmettez pas encore de données personnelles.",ht:"Enskripsyon fèmen pou kounye a pandan n ap prepare sekirite ak règleman legal yo. Pa voye done pèsonèl ankò."},
 "Las denuncias estarán disponibles cuando finalice la preparación de privacidad y seguridad.":{en:"Reporting will open after privacy and safety preparations are complete.",de:"Die Meldefunktion wird nach Abschluss der Datenschutz- und Sicherheitsvorbereitungen geöffnet.",fr:"Les signalements seront ouverts après les préparatifs de confidentialité et de sécurité.",ht:"Rapò yo ap disponib lè preparasyon sou vi prive ak sekirite fini."},
 "⚑ Reportar anuncio":{en:"⚑ Report listing",de:"⚑ Anzeige melden",fr:"⚑ Signaler l’annonce",ht:"⚑ Rapòte anons"},
 "🔒":{en:"🔒",de:"🔒",fr:"🔒",ht:"🔒"}
 };
 const sourceMap={};
 for(const [es,translations] of Object.entries(strings))for(const [lang,val] of Object.entries(translations)){sourceMap[lang]??=new Map();sourceMap[lang].set(es,val);}
 const qs=new URLSearchParams(location.search);
 const pathLanguage=location.pathname.match(/^\/(en|de|fr|ht)\/$/)?.[1];
 const legacyLanguage=qs.get('lang');
 // Keep old shared links working while giving every language its own canonical URL.
 if(!pathLanguage&&Object.hasOwn(languages,legacyLanguage)&&legacyLanguage!=='es'){
  location.replace('/'+legacyLanguage+'/');
  return;
 }
 let current=pathLanguage||'es';
 const picker=document.createElement('select');picker.id='language-picker';picker.setAttribute('aria-label','Language / Idioma');
 picker.style.cssText='font:inherit;font-size:14px;color:#102b46;background:#fff;border:1px solid #aac0cc;border-radius:8px;padding:7px 8px;width:auto;min-width:135px';
 for(const [key,label] of Object.entries(languages))picker.add(new Option(label,key));
 picker.value=current;
 const nav=document.querySelector('header nav');
 nav?.append(picker);
 const originals=new WeakMap();
 const placeholders=new Map([
 ['Describe el problema sin incluir nombres, teléfonos ni direcciones',{en:'Describe the issue without names, phone numbers or addresses',de:'Beschreibe das Problem ohne Namen, Telefonnummern oder Adressen',fr:'Décrivez le problème sans noms, téléphones ni adresses',ht:'Dekri pwoblèm nan san non, nimewo telefòn oswa adrès'}]
 ]);
 const translateExact=(raw)=>{
  const trimmed=raw.trim();if(!trimmed)return raw;
  const translation=sourceMap[current]?.get(trimmed);
  if(!translation)return raw;
  const a=raw.indexOf(trimmed),b=a+trimmed.length;
  return raw.slice(0,a)+translation+raw.slice(b);
 };
 function localize(){
  document.documentElement.lang=current==='ht'?'ht':current;
  document.title=current==='es'?'OficioRD | Encuentra quien lo resuelva':({en:'OficioRD | Find the right professional',de:'OficioRD | Die passenden Fachleute finden',fr:'OficioRD | Trouvez le bon professionnel',ht:'OficioRD | Jwenn bon pwofesyonèl la'})[current];
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){
   const parent=node.parentElement;
   if(!parent||parent.closest('script,style,textarea,.job h3,.job p'))continue;
   if(!originals.has(node))originals.set(node,node.nodeValue);
   const base=originals.get(node);const next=current==='es'?base:translateExact(base);
   if(node.nodeValue!==next)node.nodeValue=next;
  }
  for(const option of document.querySelectorAll('select:not(#language-picker) option')){
   if(!originals.has(option))originals.set(option,option.textContent);
   const base=originals.get(option);
   const translated=current==='es'?base:translateExact(base);
   if(option.textContent!==translated)option.textContent=translated;
  }
  for(const field of document.querySelectorAll('textarea[placeholder]')){
   if(!originals.has(field))originals.set(field,field.placeholder);
   const base=originals.get(field);
   field.placeholder=current==='es'?base:(placeholders.get(base)?.[current]||base);
  }
 }
 let pending=false,translating=false;
 const observer=new MutationObserver(()=>{
  if(translating||pending)return;
  pending=true;queueMicrotask(()=>{pending=false;translating=true;observer.disconnect();try{localize();}finally{observer.observe(document.body,{subtree:true,childList:true,characterData:true});translating=false;}});
 });
 picker.addEventListener('change',()=>{
  const language=picker.value;
  location.assign(language==='es'?'/':'/'+language+'/');
 });
 translating=true;localize();translating=false;
 observer.observe(document.body,{subtree:true,childList:true,characterData:true});
})();
