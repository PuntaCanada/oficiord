// Canonical shared fictional catalog for both perspectives. No user data or network calls.
import {providers,regions,categories,exampleQuotes} from '../crear/engine.mjs';
export {providers,regions,categories};
export const jobs=[
 {id:'s1',region:'Higüey',category:'ac',urgency:'soon',title:{es:'Aire acondicionado sin frío',en:'AC unit not cooling',de:'Klimaanlage kühlt nicht',fr:'Climatiseur ne refroidit pas',ht:'Èkondisyone pa refwadi'},description:{es:'Revisar una unidad de ejemplo que no enfría.',en:'Check a fictional AC unit that is not cooling.',de:'Eine fiktive Klimaanlage soll überprüft werden.',fr:'Vérifier un climatiseur fictif.',ht:'Tcheke yon èkondisyone envante.'}},
 {id:'s2',region:'Bávaro',category:'plumbing',urgency:'flexible',title:{es:'Fuga en la cocina',en:'Kitchen leak',de:'Wasserleck in der Küche',fr:'Fuite dans la cuisine',ht:'Flit dlo nan kwizin'},description:{es:'Reparar una fuga inventada en una tubería.',en:'Fix an imaginary leaking kitchen pipe.',de:'Eine erfundene undichte Küchenleitung reparieren.',fr:'Réparer une fuite imaginaire.',ht:'Repare yon tiyo envante k ap koule.'}},
 {id:'s3',region:'Verón',category:'appliance',urgency:'urgent',title:{es:'Lavadora sin centrifugado',en:'Washing machine not spinning',de:'Waschmaschine schleudert nicht',fr:'Lave-linge sans essorage',ht:'Machin lave pa tòde'},description:{es:'Diagnóstico ficticio de una lavadora.',en:'Fictional washing machine inspection.',de:'Fiktive Fehlersuche an einer Waschmaschine.',fr:'Diagnostic fictif du lave-linge.',ht:'Tès envante pou machin lave.'}},
 {id:'s4',region:'Punta Cana',category:'electric',urgency:'soon',title:{es:'Instalar luces interiores',en:'Install interior lights',de:'Innenlampen installieren',fr:'Installer des luminaires',ht:'Enstale limyè anndan'},description:{es:'Instalar lámparas en una casa inventada.',en:'Install lamps in an imaginary home.',de:'Lampen in einem erfundenen Haus montieren.',fr:'Installer des lampes dans une maison fictive.',ht:'Enstale lanp nan yon kay envante.'}},
 {id:'s5',region:'Higüey',category:'paint',urgency:'flexible',title:{es:'Pintar una habitación',en:'Paint a bedroom',de:'Schlafzimmer streichen',fr:'Peindre une chambre',ht:'Pentire yon chanm'},description:{es:'Pintura y preparación de un cuarto ficticio.',en:'Prepare and paint an imaginary bedroom.',de:'Ein erfundenes Schlafzimmer vorbereiten und streichen.',fr:'Préparer et peindre une chambre fictive.',ht:'Prepare epi pentire yon chanm envante.'}},
 {id:'s6',region:'Bávaro',category:'clean',urgency:'soon',title:{es:'Limpieza de apartamento',en:'Apartment cleaning',de:'Wohnungsreinigung',fr:'Nettoyage d’appartement',ht:'Netwaye apatman'},description:{es:'Limpieza de un apartamento de ejemplo.',en:'Cleaning a sample apartment.',de:'Eine Beispielwohnung reinigen.',fr:'Nettoyer un appartement imaginaire.',ht:'Netwaye yon apatman egzanp.'}},
 {id:'s7',region:'Punta Cana',category:'ac',urgency:'flexible',title:{es:'Mantenimiento preventivo de A/C',en:'Preventive AC maintenance',de:'Wartung einer Klimaanlage',fr:'Entretien préventif climatisation',ht:'Antretyen èkondisyone'},description:{es:'Mantenimiento simulado de un equipo de ejemplo.',en:'Fictional preventive cooling service.',de:'Fiktive Wartung einer Beispielanlage.',fr:'Entretien fictif d’un appareil.',ht:'Antretyen egzanp yon aparèy.'}},
 {id:'s8',region:'Verón',category:'clean',urgency:'flexible',title:{es:'Limpieza antes de recibir visitas',en:'Cleaning before guests arrive',de:'Reinigung vor Gästeankunft',fr:'Nettoyage avant invités',ht:'Netwayaj anvan vizitè'},description:{es:'Limpiar un alojamiento imaginario.',en:'Clean an imaginary accommodation.',de:'Eine fiktive Ferienunterkunft reinigen.',fr:'Nettoyer un logement fictif.',ht:'Netwaye yon lojman envante.'}}
];

export const supportedLanguages=Object.freeze(['es','en','de','fr','ht']);
export const jobById=id=>jobs.find(x=>x.id===id)||null;
export function canonicalDraft(job){
 if(!job)return null;
 return {region:job.region,category:job.category,urgency:job.urgency,title:job.title.es,
  description:'Esta es una tarea inventada sin ningún dato personal ni cliente real.'};
}
export function quoteFor(jobId,providerId){
 const job=jobById(jobId);if(!job)return null;
 return exampleQuotes(canonicalDraft(job)).find(q=>q.id===providerId)||null;
}
export function matchedProviders(jobId){
 const job=jobById(jobId);if(!job)return [];
 return providers.filter(p=>p.areas.includes(job.region)&&p.cats.includes(job.category));
}
