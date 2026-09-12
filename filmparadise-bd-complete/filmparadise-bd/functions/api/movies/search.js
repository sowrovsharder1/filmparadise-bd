import {BASE_SELECT,normalizeMovie,safeLimit} from '../../_lib/db.js';
import {verifySession} from '../../_lib/auth.js';
export async function onRequestGet({env,request}){
  if(!env.DB)return Response.json({error:'D1 database is not connected yet.'},{status:503});
  const u=new URL(request.url),q=(u.searchParams.get('q')||'').trim().slice(0,120),limit=safeLimit(u.searchParams.get('limit'),40,100),admin=await verifySession(request,env),requestedAdmin=u.searchParams.get('admin')==='1';
  if(requestedAdmin&&!admin)return Response.json({error:'Authentication required'},{status:401});
  const status=(admin&&requestedAdmin)?'all':'published'; const params=[]; const conditions=[];
  if(status!=='all'){conditions.push(`m.status='published'`)}
  if(q){conditions.push(`(LOWER(m.title) LIKE LOWER(?) OR LOWER(m.description) LIKE LOWER(?) OR LOWER(m.language) LIKE LOWER(?) OR LOWER(m.genre) LIKE LOWER(?))`);const like=`%${q}%`;params.push(like,like,like,like)}
  const where=conditions.length?'WHERE '+conditions.join(' AND '):'';
  const countSql=`SELECT COUNT(DISTINCT m.id) AS total FROM movies m ${where}`;
  const total=(await env.DB.prepare(countSql).bind(...params).first())?.total||0;
  const sql=`${BASE_SELECT} ${where} GROUP BY m.id ORDER BY m.is_pinned DESC,m.created_at DESC LIMIT ?`;
  const rows=await env.DB.prepare(sql).bind(...params,limit).all();
  return Response.json({items:(rows.results||[]).map(normalizeMovie),total});
}
