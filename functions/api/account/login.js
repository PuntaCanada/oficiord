// Login must never be implemented as unverified account lookup or email-only login.
const json=(body,status=503)=>Response.json(body,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
export async function onRequestGet(){return json({error:'LOGIN_NOT_ENABLED'});}
export async function onRequestPost(){return json({error:'LOGIN_NOT_ENABLED'});}
