// Fictional-only, deterministic quote comparison engine. No API or storage.
export const regions=['Higüey','Bávaro','Punta Cana','Verón'];
export const categories=['ac','plumbing','electric','clean','paint','appliance'];
export const providers=Object.freeze([
 {id:'demo-01',name:'Equipo de ejemplo A',area:'Higüey',areas:['Higüey','Verón'],cats:['ac','appliance'],base:2450,eta:2,photo:'hvac'},
 {id:'demo-02',name:'Equipo de ejemplo B',area:'Bávaro',areas:['Bávaro','Higüey','Punta Cana'],cats:['ac','plumbing'],base:3100,eta:3,photo:'plumbing'},
 {id:'demo-03',name:'Equipo de ejemplo C',area:'Verón',areas:['Verón','Higüey','Punta Cana'],cats:['ac','clean','paint'],base:2750,eta:4,photo:'cleaning'},
 {id:'demo-04',name:'Equipo de ejemplo D',area:'Punta Cana',areas:['Punta Cana','Bávaro'],cats:['electric','plumbing'],base:3300,eta:2,photo:'electric'},
 {id:'demo-05',name:'Equipo de ejemplo E',area:'Higüey',areas:['Higüey','Bávaro','Verón'],cats:['electric','appliance','paint'],base:2900,eta:3,photo:'electric'},
 {id:'demo-06',name:'Equipo de ejemplo F',area:'Bávaro',areas:['Bávaro','Punta Cana','Verón'],cats:['plumbing','clean'],base:2350,eta:5,photo:'cleaning'},
 {id:'demo-07',name:'Equipo de ejemplo G',area:'Verón',areas:['Verón','Higüey','Bávaro'],cats:['clean','paint'],base:2650,eta:2,photo:'cleaning'},
 {id:'demo-08',name:'Equipo de ejemplo H',area:'Punta Cana',areas:['Punta Cana','Bávaro','Higüey'],cats:['electric','appliance','plumbing'],base:3750,eta:1,photo:'appliances'}
]);
const categoryMultiplier={ac:1.2,plumbing:1,electric:1.3,clean:0.8,paint:1.1,appliance:1.25};
const timeAdd={flexible:0,soon:1,urgent:2};
export function validateDraft(draft){
 if(!draft||!regions.includes(draft.region)||!categories.includes(draft.category))return false;
 if(typeof draft.title!=='string'||draft.title.trim().length<6||draft.title.trim().length>70)return false;
 if(typeof draft.description!=='string'||draft.description.trim().length<15||draft.description.trim().length>300)return false;
 if(!Object.hasOwn(timeAdd,draft.urgency))return false;
 return true;
}
export function exampleQuotes(draft,sort='price'){
 if(!validateDraft(draft))return [];
 const matches=providers.filter(p=>p.areas.includes(draft.region)&&p.cats.includes(draft.category));
 const quotes=matches.map(p=>{
  const amount=Math.round((p.base*categoryMultiplier[draft.category]+timeAdd[draft.urgency]*350)/50)*50;
  const days=Math.max(1,p.eta-(draft.urgency==='urgent'?1:0));
  return {id:p.id,provider:p.name,area:p.area,areas:[...p.areas],cats:[...p.cats],
   amount,days,photo:p.photo,illustrative:true};
 });
 if(sort==='time')quotes.sort((a,b)=>a.days-b.days||a.amount-b.amount||a.id.localeCompare(b.id));
 else if(sort==='high')quotes.sort((a,b)=>b.amount-a.amount||a.id.localeCompare(b.id));
 else quotes.sort((a,b)=>a.amount-b.amount||a.id.localeCompare(b.id));
 return quotes;
}
export function chooseExampleQuote(draft,id){
 return exampleQuotes(draft).find(q=>q.id===id)||null;
}
