// Fail-closed until full account authentication has launched.
// Uses no DB or active cookie clearing to avoid creating a false signed-out state.
const reply=()=>Response.json({error:'LOGOUT_NOT_ENABLED'},{status:503,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
export async function onRequestGet(){return reply();}
export async function onRequestPost(){return reply();}
