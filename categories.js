import {requireAdmin, verifySession} from '../_lib/auth.js';

export async function onRequestGet({env,request}){
  if(!env.DB)return Response.json({error:'D1 database is not connected yet.'},{status:503});
  const admin=await verifySession(request,env);
  const rows=await env.DB.prepare(`SELECT id,name,slug FROM categories ORDER BY sort_order ASC,name ASC`).all();
  return Response.json({items:rows.results||[],admin});
}
