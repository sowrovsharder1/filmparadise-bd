import {requireAdmin,requireSameOrigin} from '../../_lib/auth.js';
import {BASE_SELECT,normalizeMovie,slugify,cleanString,cleanBool,validHttpUrl} from '../../_lib/db.js';

const allowedTypes=new Set(['movie','series']);
const allowedStatuses=new Set(['published','draft']);
function normalizePayload(body){
  const category_slugs=Array.isArray(body.category_slugs)?body.category_slugs.map(x=>slugify(x)).filter(Boolean).slice(0,20):[];
  const year=body.year==null||body.year===''?null:Number.parseInt(body.year,10);
  return {
    title:cleanString(body.title,180), type:allowedTypes.has(body.type)?body.type:'movie', year:Number.isFinite(year)&&year>=1888&&year<=2100?year:null,
    language:cleanString(body.language,60),genre:cleanString(body.genre,180),quality:cleanString(body.quality,40),duration:cleanString(body.duration,40),imdb_rating:cleanString(body.imdb_rating,10),country:cleanString(body.country,80),director:cleanString(body.director,180),cast:cleanString(body.cast,300),release_date:body.release_date?cleanString(body.release_date,10):null,description:cleanString(body.description,5000),poster_url:validHttpUrl(body.poster_url)||'',download_url_1:validHttpUrl(body.download_url_1)||'',download_url_2:validHttpUrl(body.download_url_2)||'',download_url_3:validHttpUrl(body.download_url_3)||'',is_featured:cleanBool(body.is_featured)?1:0,is_pinned:cleanBool(body.is_pinned)?1:0,status:allowedStatuses.has(body.status)?body.status:'draft',category_slugs
  };
}
async function uniqueSlug(db,base,ignoreId=null){let s=base||'untitled';for(let i=0;i<30;i++){const candidate=i?s+'-'+i:s;const q=ignoreId?await db.prepare('SELECT id FROM movies WHERE slug=? AND id<>?').bind(candidate,ignoreId).first():await db.prepare('SELECT id FROM movies WHERE slug=?').bind(candidate).first();if(!q)return candidate;}return `${s}-${crypto.randomUUID().slice(0,8)}`;}
async function replaceCategories(db,movieId,slugs){await db.prepare('DELETE FROM movie_categories WHERE movie_id=?').bind(movieId).run();for(const slug of slugs){const cat=await db.prepare('SELECT id FROM categories WHERE slug=?').bind(slug).first();if(cat)await db.prepare('INSERT OR IGNORE INTO movie_categories(movie_id,category_id) VALUES(?,?)').bind(movieId,cat.id).run();}}
async function getItem(db,id){const row=await db.prepare(`${BASE_SELECT} WHERE m.id=? GROUP BY m.id`).bind(id).first();return normalizeMovie(row)}

export async function onRequestPost({request,env}){
 const origin=requireSameOrigin(request);if(origin)return origin;const auth=await requireAdmin(request,env);if(auth)return auth;if(!env.DB)return Response.json({error:'D1 database is not connected.'},{status:503});
 let body;try{body=await request.json()}catch{return Response.json({error:'Invalid JSON'},{status:400})}const p=normalizePayload(body);if(!p.title)return Response.json({error:'Title is required.'},{status:400});
 const slug=await uniqueSlug(env.DB,slugify(p.title));const r=await env.DB.prepare(`INSERT INTO movies (title,slug,type,description,poster_url,year,language,genre,quality,duration,imdb_rating,country,cast,director,release_date,is_featured,is_pinned,status,download_url_1,download_url_2,download_url_3,views,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`).bind(p.title,slug,p.type,p.description,p.poster_url,p.year,p.language,p.genre,p.quality,p.duration,p.imdb_rating,p.country,p.cast,p.director,p.release_date,p.is_featured,p.is_pinned,p.status,p.download_url_1,p.download_url_2,p.download_url_3).run();
 await replaceCategories(env.DB,r.meta.last_row_id,p.category_slugs);return Response.json({item:await getItem(env.DB,r.meta.last_row_id)},{status:201});
}
