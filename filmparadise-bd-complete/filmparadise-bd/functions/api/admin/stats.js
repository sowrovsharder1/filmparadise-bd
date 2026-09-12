import {requireAdmin} from '../../_lib/auth.js';
export async function onRequestGet({env,request}){
  const auth=await requireAdmin(request,env);if(auth)return auth;if(!env.DB)return Response.json({error:'D1 database is not connected.'},{status:503});
  const rows=await env.DB.batch([
    env.DB.prepare(`SELECT COUNT(*) AS n FROM movies`),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM movies WHERE type='movie'`),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM movies WHERE type='series'`),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM movies WHERE status='published'`),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM movies WHERE status='draft'`)
  ]);
  return Response.json({total:rows[0].results?.[0]?.n||0,movies:rows[1].results?.[0]?.n||0,series:rows[2].results?.[0]?.n||0,published:rows[3].results?.[0]?.n||0,draft:rows[4].results?.[0]?.n||0});
}
