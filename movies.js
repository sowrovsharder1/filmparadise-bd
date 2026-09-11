import {BASE_SELECT,normalizeMovie,safeLimit,safeOffset} from '../_lib/db.js';
import {verifySession} from '../_lib/auth.js';

export async function onRequestGet({env,request}){
  if(!env.DB)return Response.json({error:'D1 database is not connected yet.'},{status:503});
  const u=new URL(request.url), admin=await verifySession(request,env), requestedAdmin=u.searchParams.get('admin')==='1';
  if(requestedAdmin && !admin)return Response.json({error:'Authentication required'},{status:401});
  const limit=safeLimit(u.searchParams.get('limit'),20,100), offset=safeOffset(u.searchParams.get('offset'));
  const type=u.searchParams.get('type'); const featured=u.searchParams.get('featured');
  const status=(admin&&requestedAdmin)?(u.searchParams.get('status')||'all'):'published';
  const where=[],params=[];
  if(status!=='all'){where.push('m.status = ?');params.push(status)}
  if(type){where.push('m.type = ?');params.push(type==='series'?'series':'movie')}
  if(featured==='1'){where.push('m.is_featured = 1')}
  const sql=`${BASE_SELECT} ${where.length?'WHERE '+where.join(' AND '):''} GROUP BY m.id ORDER BY m.is_pinned DESC, m.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit,offset);
  const rows=await env.DB.prepare(sql).bind(...params).all();
  return Response.json({items:(rows.results||[]).map(normalizeMovie)});
}
