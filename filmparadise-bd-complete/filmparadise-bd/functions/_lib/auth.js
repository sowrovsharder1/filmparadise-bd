const COOKIE = 'fp_admin_session';
const TTL = 60 * 60 * 24;

function bytesToBase64Url(bytes) {
  let s = ''; for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function textToBase64Url(text){return bytesToBase64Url(new TextEncoder().encode(text));}
function base64UrlToText(s){const pad=s.length%4===0?'':'='.repeat(4-s.length%4);const bin=atob(s.replace(/-/g,'+').replace(/_/g,'/')+pad);const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));return new TextDecoder().decode(bytes)}
async function hmac(secret,data){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(data))))}
function parseCookies(header=''){return Object.fromEntries(header.split(';').map(p=>p.trim()).filter(Boolean).map(p=>{const i=p.indexOf('=');return i<0?[p,'']:[p.slice(0,i),decodeURIComponent(p.slice(i+1))]}))}
function sameOrigin(request){const origin=request.headers.get('Origin');return !origin || origin===new URL(request.url).origin}
function constantTimeEqual(a,b){if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0}

export async function verifySession(request, env){
  const secret=env.SESSION_SECRET||env.ADMIN_PASSWORD;
  if(!secret) return false;
  const token=parseCookies(request.headers.get('Cookie')||'')[COOKIE]; if(!token) return false;
  const [payload,sig]=token.split('.'); if(!payload||!sig)return false;
  try{const expected=await hmac(secret,payload);if(!constantTimeEqual(expected,sig))return false;const data=JSON.parse(base64UrlToText(payload));return data?.exp > Math.floor(Date.now()/1000) && data?.u === (env.ADMIN_USERNAME||'admin');}catch{return false}
}

export async function requireAdmin(request, env){
  if(!await verifySession(request,env)) return new Response(JSON.stringify({error:'Authentication required'}),{status:401,headers:{'Content-Type':'application/json'}});
  return null;
}

export function requireSameOrigin(request){if(!sameOrigin(request))return new Response(JSON.stringify({error:'Cross-site request blocked'}),{status:403,headers:{'Content-Type':'application/json'}});return null;}

export async function issueSession(username, env){
  const secret=env.SESSION_SECRET||env.ADMIN_PASSWORD;
  const payload=textToBase64Url(JSON.stringify({u:username,exp:Math.floor(Date.now()/1000)+TTL}));
  const sig=await hmac(secret,payload); return `${payload}.${sig}`;
}
export function sessionCookie(token){return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${TTL}`}
export function clearSessionCookie(){return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`}

export {parseCookies};
