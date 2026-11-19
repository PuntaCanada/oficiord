// Pilot-only homepage form: URL GET navigation into fictional demo; no storage, API or account data.
(()=>{
 const form=document.getElementById('od-find-form');if(!form)return;
 const translations={
  es:['EXPLORA LA DEMO · SIN REGISTRO','Encuentra un servicio en tu zona','Prueba la búsqueda con trabajos y profesionales ficticios. No se realizan contrataciones ni se comparten datos.','Servicio','Todos los servicios','Zona','Todas las zonas','Palabra clave (opcional)','Explorar ejemplos →','Ej.: lavadora'],
  en:['EXPLORE THE DEMO · NO SIGN-UP','Find a service in your area','Try the search with fictional jobs and profiles. No hiring or personal data sharing.','Service','All services','Area','All areas','Keyword (optional)','Explore examples →','E.g. washing machine'],
  de:['DEMO ENTDECKEN · OHNE ANMELDUNG','Dienstleistungen in deiner Region finden','Suche ausschließlich in erfundenen Aufträgen und Profilen. Keine Vermittlung, keine Datenweitergabe.','Dienstleistung','Alle Dienstleistungen','Region','Alle Regionen','Suchbegriff (optional)','Beispiele erkunden →','Z. B. Waschmaschine'],
  fr:['EXPLORER LA DÉMO · SANS COMPTE','Trouvez un service près de chez vous','Recherchez uniquement dans des travaux et profils fictifs. Aucun recrutement ni partage de données.','Service','Tous les services','Zone','Toutes les zones','Mot-clé (facultatif)','Voir les exemples →','Ex. : lave-linge'],
  ht:['GADE DEMO A · SAN KONT','Chèche yon sèvis nan zòn ou','Teste rechèch la ak travay ak pwofil envante. Pa gen kontra ni pataj done pèsonèl.','Sèvis','Tout sèvis','Zòn','Tout zòn','Mo kle (si ou vle)','Gade egzanp yo →','Eg.: machin lave']
 };
 const keys=['kicker','heading','description','serviceLabel','allServices','zoneLabel','allZones','searchLabel','submit'];
 const locale=document.documentElement.lang.split('-')[0];
 const lang=Object.hasOwn(translations,locale)?locale:'es';
 document.getElementById('od-find-lang').value=lang;
 const t=translations[lang];
 for(let i=0;i<keys.length;i++){const element=form.closest('.od-find').querySelector('[data-od-copy="'+keys[i]+'"]');if(element)element.textContent=t[i];}
 document.getElementById('od-find-query').placeholder=t[9];
 const services={es:['Aire acondicionado','Plomería','Electricidad','Limpieza','Pintura','Electrodomésticos'],en:['Air conditioning','Plumbing','Electrical','Cleaning','Painting','Appliances'],de:['Klimaanlagen','Sanitär','Elektro','Reinigung','Malerarbeiten','Haushaltsgeräte'],fr:['Climatisation','Plomberie','Électricité','Nettoyage','Peinture','Électroménager'],ht:['Èkondisyone','Plonbri','Elektrisite','Netwayaj','Penti','Aparèy kay']};
 Array.from(document.getElementById('od-find-service').options).slice(1).forEach((o,i)=>o.textContent=services[lang][i]);
})();