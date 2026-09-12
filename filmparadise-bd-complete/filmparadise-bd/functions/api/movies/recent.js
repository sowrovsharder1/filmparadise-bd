import {BASE_SELECT,normalizeMovie,safeLimit} from '../../_lib/db.js';
export async function onRequestGet({env,request}){
  if(!env.DB)return Response.json({error:'D1 database is not connected yet.'},{status:503});
  const u=new URL(request.url),limit=safeLimit(u.searchParams.get('limit'),20,40);
  const rows=await env.DB.prepare(`${BASE_SELECT} WHERE m.status='published' GROUP BY m.id ORDER BY m.is_pinned DESC,m.created_at DESC LIMIT ?`).bind(limit).all();
  return Response.json({items:(rows.results||[]).map(normalizeMovie)});
}
