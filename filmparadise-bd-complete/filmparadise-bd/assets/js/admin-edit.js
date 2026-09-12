async function apiReq(url,options={}){const r=await fetch(url,options);const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Request failed');return d;}
let current;
function field(id,label,type='text',extra=''){return `<div class="form-field"><label for="${id}">${label}</label><input id="${id}" type="${type}" ${extra}></div>`}
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
async function renderForm(item){
 const d=await apiReq('/api/categories');
 const checked=new Set(item.categories?.map(c=>c.slug)||[]);
 const f=document.getElementById('title-form');
 f.innerHTML=`
 <div class="form-field full"><label for="title">Title *</label><input id="title" value="${esc(item.title)}" maxlength="180" required></div>
 <div class="form-field"><label for="type">Type</label><select id="type"><option value="movie" ${item.type==='movie'?'selected':''}>Movie</option><option value="series" ${item.type==='series'?'selected':''}>Web Series</option></select></div>
 ${field('year','Year','number',`value="${esc(item.year||'')}" min="1888" max="2100"`)}
 ${field('language','Language','text',`value="${esc(item.language||'')}" maxlength="60"`)}
 ${field('genre','Genre','text',`value="${esc(item.genre||'')}" maxlength="180"`)}
 ${field('quality','Quality','text',`value="${esc(item.quality||'')}" maxlength="40"`)}
 ${field('duration','Duration','text',`value="${esc(item.duration||'')}" maxlength="40"`)}
 ${field('imdb_rating','IMDb rating','text',`value="${esc(item.imdb_rating||'')}" maxlength="10"`)}
 ${field('country','Country','text',`value="${esc(item.country||'')}" maxlength="80"`)}
 ${field('director','Director','text',`value="${esc(item.director||'')}" maxlength="180"`)}
 <div class="form-field full"><label for="cast">Cast</label><input id="cast" value="${esc(item.cast||'')}" maxlength="300"></div>
 ${field('release_date','Release date','date',`value="${esc(item.release_date||'')}"`)}
 <div class="form-field"><label for="poster">Replace poster</label><input id="poster" type="file" accept="image/jpeg,image/png,image/webp"></div>
 <div class="form-field full"><label for="description">Description</label><textarea id="description" maxlength="5000">${esc(item.description||'')}</textarea></div>
 <div class="form-field full"><label>Categories</label><div id="category-list" class="cat-select">${d.items.map(c=>`<label><input type="checkbox" value="${esc(c.slug)}" ${checked.has(c.slug)?'checked':''}> ${esc(c.name)}</label>`).join('')}</div></div>
 <div class="form-field full"><label>Download links</label><div class="form-grid">
   <div class="form-field"><label for="download_url_1">Server 1</label><input id="download_url_1" type="url" value="${esc(item.download_url_1||'')}"></div>
   <div class="form-field"><label for="download_url_2">Server 2</label><input id="download_url_2" type="url" value="${esc(item.download_url_2||'')}"></div>
   <div class="form-field"><label for="download_url_3">Server 3</label><input id="download_url_3" type="url" value="${esc(item.download_url_3||'')}"></div>
 </div></div>
 <div class="form-field full"><div class="check-row"><label class="check"><input id="is_featured" type="checkbox" ${item.is_featured?'checked':''}> Featured</label><label class="check"><input id="is_pinned" type="checkbox" ${item.is_pinned?'checked':''}> Pinned</label><label class="check">Status <select id="status" style="border:0;background:transparent;color:#fff"><option value="published" ${item.status==='published'?'selected':''}>Published</option><option value="draft" ${item.status==='draft'?'selected':''}>Draft</option></select></label></div></div>
 <div class="form-field full"><div class="actions" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" type="submit">Save changes</button><a class="btn" href="/movie?slug=${encodeURIComponent(item.slug)}" target="_blank">View public page</a><button id="delete-current" class="btn" type="button">Delete</button></div></div>`;
 f.addEventListener('submit',saveEdit,{once:true});
 document.getElementById('delete-current').addEventListener('click',deleteCurrent);
}
async function saveEdit(e){e.preventDefault();const msg=document.getElementById('form-message');msg.innerHTML='<div class="notice">Saving…</div>';try{
 const file=document.getElementById('poster').files[0]; let poster=current.poster_url||'';
 if(file){const fd=new FormData();fd.append('poster',file);const r=await apiReq('/api/admin/upload-poster',{method:'POST',body:fd});poster=r.url}
 const payload={title:document.getElementById('title').value.trim(),type:document.getElementById('type').value,year:Number(document.getElementById('year').value)||null,language:document.getElementById('language').value.trim(),genre:document.getElementById('genre').value.trim(),quality:document.getElementById('quality').value.trim(),duration:document.getElementById('duration').value.trim(),imdb_rating:document.getElementById('imdb_rating').value.trim(),country:document.getElementById('country').value.trim(),director:document.getElementById('director').value.trim(),cast:document.getElementById('cast').value.trim(),release_date:document.getElementById('release_date').value||null,description:document.getElementById('description').value.trim(),poster_url:poster,category_slugs:[...document.querySelectorAll('#category-list input:checked')].map(x=>x.value),download_url_1:document.getElementById('download_url_1').value.trim(),download_url_2:document.getElementById('download_url_2').value.trim(),download_url_3:document.getElementById('download_url_3').value.trim(),is_featured:document.getElementById('is_featured').checked,is_pinned:document.getElementById('is_pinned').checked,status:document.getElementById('status').value};
 const d=await apiReq('/api/admin/movies/'+current.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});current=d.item;msg.innerHTML='<div class="notice success">Saved successfully.</div>';await renderForm(current);
 }catch(err){msg.innerHTML=`<div class="notice error">${esc(err.message)}</div>`}}
async function deleteCurrent(){if(!confirm('Delete this title permanently?'))return;try{await apiReq('/api/admin/movies/'+current.id,{method:'DELETE'});location.href='/admin'}catch(err){alert(err.message)}}
async function start(){try{const me=await fetch('/api/admin/me');if(!me.ok)throw new Error('unauthorized');const id=new URLSearchParams(location.search).get('id');if(!id)throw new Error('Missing title id');const d=await apiReq('/api/movies/id/'+encodeURIComponent(id)+'?admin=1');current=d.item;document.title=`Edit ${current.title} — FilmParadise BD`;await renderForm(current)}catch(e){location.href='/admin/login'}}
document.addEventListener('DOMContentLoaded',start);
