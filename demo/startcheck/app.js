// Informational pre-launch checklist only. All statuses are fixed; no toggles or persistence.
const translations={
es:{eyebrow:'PREPARACIÓN · SIN LANZAMIENTO',title:'Antes de abrir el mercado, la seguridad es lo primero.',lead:'Consulta los controles de preparación y las condiciones que todavía bloquean el lanzamiento.',hold:'LANZAMIENTO BLOQUEADO',holdText:'No está permitido abrir cuentas, trabajos, mensajes, presupuestos, pagos o reseñas. Las pruebas verdes no autorizan el lanzamiento.',done:'Controles técnicos documentados',blocked:'Condiciones de lanzamiento pendientes',live:'Funciones reales abiertas en esta demostración',completed:'Preparación técnica realizada',pending:'Pendiente antes del lanzamiento',fine:'Pruebas automáticas y documentación, no certificación de seguridad, accesibilidad ni cumplimiento legal.',more:'Más idiomas ▾',back:'← Demostración',return:'Volver a la demostración',footer:'OficioRD · Lista informativa, sin cuentas ni operaciones reales.',
doneItems:['Demos aisladas, ficticias y sin almacenamiento','Pruebas automáticas de roles y propiedad de los trabajos','Solicitudes y ofertas reales bloqueadas por defecto','Navegación por teclado y controles móviles mejorados'],
blockedItems:['Autorización expresa para activar funciones reales','Revisión jurídica y privacidad para República Dominicana','Pruebas de permisos, concurrencia y seguridad en entorno aislado','Controles reales contra spam y abuso con moderación','Pruebas manuales con Safari iOS, Chrome Android y lectores de pantalla','Planes de atención, disputas, copias de seguridad y costes','Lanzamiento por fases con aprobación, rollback y límites de gasto']},
en:{eyebrow:'PREPARATION · NOT LAUNCHED',title:'Safety comes first, before opening the marketplace.',lead:'See what is tested and what still blocks a real launch.',hold:'LAUNCH BLOCKED',holdText:'No authorization to open accounts, jobs, chats, quotes, payments or reviews. Green tests do not authorize launch.',done:'Documented technical checks',blocked:'Pending launch requirements',live:'Real features enabled in this demonstration',completed:'Preparation checks completed',pending:'Pending before launch',fine:'Automated tests and documented plans, not security, accessibility or legal certification.',more:'More languages ▾',back:'← Demo',return:'Back to the demo',footer:'OficioRD · Informational checklist without real accounts or transactions.',
doneItems:['Isolated, fictional demos without persistence','Automated tests for account roles and job ownership','Real requests and offers blocked by default','Improved keyboard navigation and mobile controls'],
blockedItems:['Explicit approval to enable real features','Legal and privacy review for the Dominican Republic','Permissions, concurrency and security testing on isolated infrastructure','Operational spam prevention and moderation','Real-device iOS Safari, Android Chrome and screen reader reviews','Support, dispute, backup and cost management plans','Staged launch approval, rollback and spending limits']},
de:{eyebrow:'VORBEREITUNG · KEIN MARKTPLATZSTART',title:'Erst Sicherheit – dann der echte Marktplatz.',lead:'Hier siehst du, was bereits technisch geprüft ist und welche Bedingungen einen echten Start noch verhindern.',hold:'MARKTPLATZSTART GESPERRT',holdText:'Keine Freigabe echter Konten, Aufträge, Chats, Angebote, Zahlungen oder Bewertungen. Grüne Tests sind keine Startgenehmigung.',done:'Dokumentierte technische Prüfungen',blocked:'Noch offene Startbedingungen',live:'Echte Funktionen in dieser Demo aktiviert',completed:'Technische Vorbereitung',pending:'Vor einem Start noch erforderlich',fine:'Automatisierte Tests und dokumentierte Maßnahmen sind keine Sicherheits-, Barrierefreiheits- oder Rechtszertifizierung.',more:'Weitere Sprachen ▾',back:'← Zur Demo',return:'Zur gemeinsamen Demo',footer:'OficioRD · Informative Checkliste ohne echte Konten oder Transaktionen.',
doneItems:['Fiktive und getrennte Demoansichten ohne Datenspeicherung','Automatisierte Prüfungen für Rollen und Auftragsberechtigungen','Echte Auftrags- und Angebotsannahme standardmäßig gesperrt','Verbesserte Tastatur- und mobile Bedienung'],
blockedItems:['Ausdrückliche Zustimmung zur Freigabe echter Funktionen','Rechts- und Datenschutzprüfung für die Dominikanische Republik','Berechtigungs-, Parallelitäts- und Sicherheitstests in einer isolierten Umgebung','Echter Spam- und Missbrauchsschutz mit Moderation','Tests auf echten iPhones, Android-Geräten und mit Screenreadern','Support-, Streitfall-, Backup- und Kostenkonzept','Stufenweise Freigabe mit Rückfallplan und Ausgabenlimit']},
fr:{eyebrow:'PRÉPARATION · AUCUN LANCEMENT',title:'La sécurité avant l’ouverture de la plateforme.',lead:'Découvrez les contrôles effectués et les exigences qui bloquent encore le lancement.',hold:'LANCEMENT BLOQUÉ',holdText:'Aucun compte, emploi, message, devis, paiement ou avis réel autorisé. Des tests réussis ne permettent pas le lancement.',done:'Contrôles techniques documentés',blocked:'Conditions restant à satisfaire',live:'Fonctions réelles activées dans cette démo',completed:'Préparations techniques',pending:'Obligations avant lancement',fine:'Ces tests et documents ne constituent pas une certification légale, de sécurité ou d’accessibilité.',more:'Autres langues ▾',back:'← Démo',return:'Retour à la démo',footer:'OficioRD · Informations sans comptes ni opérations réelles.',
doneItems:['Démonstrations fictives séparées et sans stockage','Tests automatiques des rôles et de la propriété des travaux','Offres et demandes réelles bloquées par défaut','Amélioration du clavier et des commandes mobiles'],
blockedItems:['Autorisation expresse d’ouvrir les fonctions réelles','Examen juridique et de confidentialité en République dominicaine','Tests de permissions, concurrence et sécurité en environnement isolé','Protection réelle contre le spam et modération','Tests sur Safari iOS, Chrome Android et lecteurs d’écran','Plans de support, litiges, sauvegardes et coûts','Lancement progressif approuvé avec retour arrière et budget']},
ht:{eyebrow:'PREPARASYON · PA GEN LANSMAN',title:'Sekirite anvan nou louvri platfòm nan.',lead:'Gade sa nou teste ak sa ki poko pare anvan lansman reyèl la.',hold:'LANSMAN BLOKE',holdText:'Nou pa otorize kont, travay, mesaj, òf, peman oswa evalyasyon reyèl. Tès ki pase pa vle di lansman otorize.',done:'Tès teknik dokimante',blocked:'Kondisyon ki poko fèt',live:'Fonksyon reyèl ki aktive nan demonstrasyon',completed:'Preparasyon teknik',pending:'Sa ki nesesè anvan lansman',fine:'Tès ak dokiman sa yo pa sètifika sekirite, aksesibilite oswa legal.',more:'Lòt lang ▾',back:'← Demo',return:'Retounen nan demo a',footer:'OficioRD · Enfòmasyon sèlman, pa gen kont ni tranzaksyon reyèl.',
doneItems:['Demo envante ki separe epi ki pa estoke done','Tès otomatik pou wòl ak dwa sou travay','Travay ak òf reyèl bloke pa defo','Pi bon navigasyon ak klavye ak telefòn'],
blockedItems:['Otorizasyon klè pou fonksyon reyèl','Revizyon legal ak vi prive nan Repiblik Dominikèn','Tès dwa, konkirans ak sekirite nan yon anviwònman izole','Vrè pwoteksyon kont spam ak moderasyon','Tès sou iOS Safari, Android Chrome ak lektè ekran','Plan asistans, konfli, backup ak depans','Lansman pa etap ak plan retou ak limit depans']}
};
const $=id=>document.getElementById(id);
let language=new URLSearchParams(location.search).get('lang');
if(!Object.hasOwn(translations,language))language='es';
const map={eyebrow:'eyebrow',title:'title',lead:'lead','hold-title':'hold','hold-detail':'holdText','done-label':'done','blocked-label':'blocked','live-label':'live','complete-heading':'completed','blocked-heading':'pending',fine:'fine','more-text':'more',back:'back',return:'return',footer:'footer'};
function render(){
 const t=translations[language];
 document.documentElement.lang=language;
 for(const [id,key] of Object.entries(map))$(id).textContent=t[key];
 $('back').href='/demo/recorrido/?lang='+language;
 $('return').href='/demo/recorrido/?lang='+language;
 $('done-count').textContent=String(t.doneItems.length);
 $('blocked-count').textContent=String(t.blockedItems.length);
 for(const [id,values,kind] of [['complete-items',t.doneItems,'pass'],['blocked-items',t.blockedItems,'block']]){
  $(id).replaceChildren(...values.map(value=>{
   const row=document.createElement('article');row.className='item '+kind;
   const indicator=document.createElement('span');indicator.className='indicator';
   indicator.textContent=kind==='pass'?'✓':'!';
   indicator.setAttribute('aria-hidden','true');
   const title=document.createElement('h3');title.textContent=value;
   row.append(indicator,title);return row;
  }));
 }
 for(const button of document.querySelectorAll('[data-lang]'))button.setAttribute('aria-pressed',String(button.dataset.lang===language));
 $('more').open=false;
}
for(const button of document.querySelectorAll('[data-lang]'))button.addEventListener('click',()=>{
 language=button.dataset.lang;
 const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);
 render();
});
render();
