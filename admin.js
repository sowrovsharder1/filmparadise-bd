function adminEsc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
async function loadAdmin(){
  try{const me=await fetch('/api/admin/me');if(!me.ok)throw new Error('unauthorized');
    const [stats,data]=await Promise.all([fetch('/api/admin/stats').then(r=>{if(!r.ok)throw new Error('stats');return r.json()}),fetch('/api/movies?admin=1&limit=100').then(r=>{if(!r.ok)throw new Error('Could not load catalog');return r.json()})]);
    const items=data.items||[];
    document.getElementById('stat-total').textContent=stats.total;
    document.getElementById('stat-movies').textContent=stats.movies;
    document.getElementById('stat-series').textContent=stats.series;
    document.getElementById('stat-published').textContent=stats.published;
    renderAdminTable(items);
  }catch(e){location.href='/admin/login';}
}
function renderAdminTable(items){
  const body=document.getElementById('admin-table');
  body.innerHTML=items.map(x=>`<tr>
    <td><img class="table-poster" src="${adminEsc(x.poster_url||'/assets/images/poster-placeholder.svg')}" alt=""></td>
    <td><strong>${adminEsc(x.title)}</strong><div class="muted" style="font-size:.68rem">${adminEsc(x.slug)}</div></td>
    <td>${adminEsc(x.type)}</td><td>${adminEsc(x.year||'—')}</td>
    <td>${x.status==='published'?'<span class="badge type">Published</span>':'<span class="badge danger">Draft</span>'}</td>
    <td>${adminEsc(new Date(x.updated_at||x.created_at||Date.now()).toLocaleDateString())}</td>
    <td><a class="btn" href="/admin/edit?id=${encodeURIComponent(x.id)}">Edit</a> <button class="btn" data-delete="${x.id}">Delete</button></td>
  </tr>`).join('');
  body.querySelectorAll('[data-delete]').forEach(btn=>btn.addEventListener('click',async()=>{
    if(!confirm('Delete this title? This cannot be undone.')) return;
    const id=btn.dataset.delete;const res=await fetch('/api/admin/movies/'+id,{method:'DELETE'});const data=await res.json();if(!res.ok)alert(data.error||'Delete failed');else loadAdmin();
  }));
}
document.addEventListener('DOMContentLoaded',()=>{
  loadAdmin();
  document.getElementById('logout')?.addEventListener('click',async()=>{await fetch('/api/admin/logout',{method:'POST'});location.href='/admin/login'});
  document.getElementById('admin-search')?.addEventListener('input',async e=>{
    const q=e.target.value.trim(); if(!q){loadAdmin();return;}
    try{const d=await fetch('/api/movies/search?q='+encodeURIComponent(q)+'&limit=100&admin=1').then(r=>r.json());renderAdminTable(d.items||[]);}catch{}
  });
});
