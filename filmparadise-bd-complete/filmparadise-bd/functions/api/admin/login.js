import {issueSession,sessionCookie,requireSameOrigin} from '../../_lib/auth.js';
function ct(a,b){if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0}
export async function onRequestPost({request,env}){
  const cross=requireSameOrigin(request);if(cross)return cross;
  if(!env.ADMIN_PASSWORD)return Response.json({error:'ADMIN_PASSWORD secret is not configured.'},{status:503});
  let body;try{body=await request.json()}catch{return Response.json({error:'Invalid JSON'},{status:400})}
  const username=String(body?.username||'');const password=String(body?.password||'');const expectedUser=String(env.ADMIN_USERNAME||'admin');
  if(!ct(username,expectedUser)||!ct(password,String(env.ADMIN_PASSWORD)))return Response.json({error:'Invalid username or password'},{status:401});
  const token=await issueSession(expectedUser,env);return new Response(JSON.stringify({ok:true}),{status:200,headers:{'Content-Type':'application/json','Set-Cookie':sessionCookie(token)}});
}
