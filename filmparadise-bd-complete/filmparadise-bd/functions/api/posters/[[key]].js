export async function onRequestGet({env,params}){
  if(!env.POSTERS)return new Response('R2 poster storage is not configured.',{status:503});
  const key=String(params.key||'').replace(/^\/+/, '');
  if(!key || key.includes('..'))return new Response('Invalid poster path',{status:400});
  const object=await env.POSTERS.get(key);
  if(!object)return new Response('Poster not found',{status:404});
  const headers=new Headers();object.writeHttpMetadata(headers);headers.set('etag',object.httpEtag);headers.set('Cache-Control','public, max-age=31536000, immutable');return new Response(object.body,{headers});
}
