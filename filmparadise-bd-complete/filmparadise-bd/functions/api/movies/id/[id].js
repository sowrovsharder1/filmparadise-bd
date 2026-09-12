import {BASE_SELECT,normalizeMovie} from '../../../_lib/db.js';
import {requireAdmin} from '../../../_lib/auth.js';

export async function onRequestGet(context){
  const {env,request,params}=context;
  if(!env.DB)return Response.json({error:'D1 database is not connected yet.'},{status:503});
  const auth=await requireAdmin(request,env); if(auth)return auth;
  const id=Number.parseInt(params.id,10); if(!Number.isFinite(id))return Response.json({error:'Invalid id'},{status:400});
  const row=await env.DB.prepare(`${BASE_SELECT} WHERE m.id=? GROUP BY m.id`).bind(id).first();
  if(!row)return Response.json({error:'Not found'},{status:404});
  return Response.json({item:normalizeMovie(row)});
}
