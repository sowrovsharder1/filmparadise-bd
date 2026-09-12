import {BASE_SELECT,normalizeMovie,safeLimit} from '../../_lib/db.js';
export async function onRequestGet({env,request,params}){
  if(!env.DB)return Response.json({error:'D1 database is not connected yet.'},{status:503});
  const limit=safeLimit(new URL(request.url).searchParams.get('limit'),40,100),slug=String(params.slug||'').slice(0,120);
  if(slug==='movie'||slug==='movies'){
    const rows=await env.DB.prepare(`${BASE_SELECT} WHERE m.status='published' AND m.type='movie' GROUP BY m.id ORDER BY m.is_pinned DESC,m.created_at DESC LIMIT ?`).bind(limit).all();return Response.json({items:(rows.results||[]).map(normalizeMovie)});
  }
  const rows=await env.DB.prepare(`${BASE_SELECT.replace('FROM movies m','FROM movies m JOIN movie_categories target_mc ON target_mc.movie_id=m.id JOIN categories target_cat ON target_cat.id=target_mc.category_id')} WHERE target_cat.slug=? AND m.status='published' GROUP BY m.id ORDER BY m.is_pinned DESC,m.created_at DESC LIMIT ?`).bind(slug,limit).all();
  return Response.json({items:(rows.results||[]).map(normalizeMovie)});
}
