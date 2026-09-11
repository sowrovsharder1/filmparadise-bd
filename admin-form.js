async function apiJson(url,options){const r=await fetch(url,options);const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Request failed');return d;}
function val(id){return document.getElementById(id)?.value?.trim()||'';}
function selectedCategories(){return [...document.querySelectorAll('#category-list input[type=checkbox]:checked')].map(x=>x.value)}
async function loadCats(){try{const d=await apiJson('/api/categories');document.getElementById('category-list').innerHTML=d.items.map(c=>`<label><input type="checkbox" value="${c.slug}"> ${c.name}</label>`).join('')}catch{document.getElementById('category-list').innerHTML='<p class="muted">D1 categories are not available yet.</p>'}}
async function uploadPoster(file){if(!file)return '';const fd=new FormData();fd.append('poster',file);const d=await apiJson('/api/admin/upload-poster',{method:'POST',body:fd});return d.url;}
async function addTitle(){
 const form=document.getElementById('title-form'), msg=document.getElementById('form-message');
 await loadCats();
 form.addEventListener('submit',async e=>{e.preventDefault();msg.innerHTML='<div class="notice">Saving…</div>';try{
   const file=document.getElementById('poster').files[0]; const poster=await uploadPoster(file);
   const payload={title:val('title'),type:val('type'),year:Number(val('year'))||null,language:val('language'),genre:val('genre'),quality:val('quality'),duration:val('duration'),imdb_rating:val('imdb_rating'),country:val('country'),director:val('director'),cast:val('cast'),release_date:val('release_date')||null,description:val('description'),poster_url:poster,category_slugs:selectedCategories(),download_url_1:val('download_url_1'),download_url_2:val('download_url_2'),download_url_3:val('download_url_3'),is_featured:document.getElementById('is_featured').checked,is_pinned:document.getElementById('is_pinned').checked,status:val('status')};
   const d=await apiJson('/api/admin/movies',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});msg.innerHTML='<div class="notice success">Published successfully.</div>';location.href='/admin/edit?id='+d.item.id;
 }catch(err){msg.innerHTML=`<div class="notice error">${err.message}</div>`}}
 )
}
document.addEventListener('DOMContentLoaded',addTitle);
