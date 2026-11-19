// Privacy intake stays closed until verified account ownership, consent and handling policy launch.
const reply=(error)=>Response.json({error},{status:503,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
export async function onRequestGet(){return reply('PRIVACY_REQUESTS_NOT_ENABLED');}
export async function onRequestPost(){return reply('PRIVACY_REQUESTS_NOT_ENABLED');}
export async function onRequestDelete(){return reply('PRIVACY_REQUESTS_NOT_ENABLED');}
