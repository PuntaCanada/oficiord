// No real bid intake until separate customer/provider accounts and ownership validation exist.
const json=(body,status=200)=>Response.json(body,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
export async function onRequestGet(){return json({error:'AUTH_REQUIRED'},401);}
export async function onRequestPost(){return json({error:'PROPOSALS_NOT_ENABLED'},503);}
