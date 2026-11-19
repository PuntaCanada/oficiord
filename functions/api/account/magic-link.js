// This endpoint is intentionally inert: no email is dispatched and no accounts are created.
const reply=(error)=>Response.json({error},{status:503,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
export async function onRequestGet(){return reply('MAGIC_LINK_NOT_ENABLED');}
export async function onRequestPost(){return reply('MAGIC_LINK_NOT_ENABLED');}
