import {BASE_SELECT,normalizeMovie} from '../../_lib/db.js';
export async function onRequestGet({env,params}){
  if(!env.DB)return Response.json({error:'D1 database is not connected yet.'},{status:503});
  const slug=String(params.slug||'').slice(0,160);
  const row=await env.DB.prepare(`${BASE_SELECT} WHERE m.slug=? AND m.status='published' GROUP BY m.id`).bind(slug).first();
  if(!row)return Response.json({error:'Title not found'},{status:404});
  await env.DB.prepare(`UPDATE movies SET views=COALESCE(views,0)+1 WHERE id=?`).bind(row.id).run();
  return Response.json({item:normalizeMovie({...row,views:(row.views||0)+1})},{headers:{'Cache-Control':'public, max-age=60'}});
}
