async function loadCategory(){
  const slug=new URLSearchParams(location.search).get('slug')||'bangla';
  const title=slug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  document.getElementById('category-title').textContent=title;
  document.title=`${title} — FilmParadise BD`;
  const grid=document.getElementById('category-grid');
  grid.innerHTML=Array.from({length:8},()=>'<div class="skeleton"></div>').join('');
  try{const data=await FP.api('/api/categories/'+encodeURIComponent(slug)+'?limit=40');FP.renderGrid(grid,data.items,`No published titles in ${title}.`)}
  catch(err){FP.renderGrid(grid,[],err.message)}
}
document.addEventListener('DOMContentLoaded',loadCategory);
