// Link redemption requires one-time atomic token consumption, CSRF controls and verified email.
const reply=(error)=>Response.json({error},{status:503,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
export async function onRequestGet(){return reply('MAGIC_LINK_NOT_ENABLED');}
export async function onRequestPost(){return reply('MAGIC_LINK_NOT_ENABLED');}
