async function login(){
  const form=document.getElementById('login-form'); const msg=document.getElementById('login-message');
  form.addEventListener('submit',async e=>{e.preventDefault();msg.innerHTML='';const fd=new FormData(form);try{const esc=(v='')=>String(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c])); const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:fd.get('username'),password:fd.get('password')})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Login failed');location.href='/admin';}catch(err){msg.innerHTML=`<div class="notice error">${esc(err.message)}</div>`;}});
}
document.addEventListener('DOMContentLoaded',login);
