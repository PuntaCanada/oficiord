// Account signup disabled until secure verification email provider, rate limiting and privacy policy exist.
const json=(body,status=503)=>Response.json(body,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
export async function onRequestGet(){return json({error:'REGISTRATION_NOT_ENABLED'});}
export async function onRequestPost(){return json({error:'REGISTRATION_NOT_ENABLED'});}
