import {requireAdmin,requireSameOrigin} from '../../_lib/auth.js';

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = new Set(['image/jpeg','image/png','image/webp']);

export async function onRequestPost({request,env}){
  const origin=requireSameOrigin(request);if(origin)return origin;
  const auth=await requireAdmin(request,env);if(auth)return auth;
  if(!env.POSTERS)return Response.json({error:'R2 bucket binding POSTERS is not configured.'},{status:503});
  const form=await request.formData(); const file=form.get('poster');
  if(!(file instanceof File))return Response.json({error:'Poster file is required.'},{status:400});
  if(!TYPES.has(file.type))return Response.json({error:'Only JPG, PNG and WEBP files are allowed.'},{status:400});
  if(file.size>MAX_BYTES)return Response.json({error:'Poster must be 5 MB or smaller.'},{status:400});
  const ext=file.type==='image/jpeg'?'jpg':file.type==='image/png'?'png':'webp';
  const safeName=crypto.randomUUID()+'.'+ext; const key=`posters/${new Date().toISOString().slice(0,10)}/${safeName}`;
  await env.POSTERS.put(key,file.stream(),{httpMetadata:{contentType:file.type,cacheControl:'public, max-age=31536000, immutable'}});
  const url=new URL(request.url); return Response.json({key,url:`${url.origin}/api/posters/${key}`});
}
