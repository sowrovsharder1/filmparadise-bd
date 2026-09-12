import {verifySession} from '../../_lib/auth.js';
export async function onRequestGet({env,request}){const ok=await verifySession(request,env);return Response.json({authenticated:ok},{status:ok?200:401})}
