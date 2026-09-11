async function searchMovies(q='') {
  const grid = document.getElementById('search-grid');
  const summary = document.getElementById('search-summary');
  grid.innerHTML = Array.from({length:8},()=>'<div class="skeleton"></div>').join('');
  try {
    const data = await FP.api('/api/movies/search?q=' + encodeURIComponent(q) + '&limit=40');
    summary.textContent = q ? `${data.total} result${data.total===1?'':'s'} for “${q}”` : `${data.total} published title${data.total===1?'':'s'} in the catalog`;
    FP.renderGrid(grid, data.items, 'No titles matched your search.');
  } catch (err) {
    const fallback = q ? [] : FP.demoMovies;
    summary.textContent = q ? `No live database available for “${q}” yet.` : 'Preview mode — connect D1 to load your real catalog.';
    FP.renderGrid(grid, fallback, 'No titles matched your search.');
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  const input=document.getElementById('search-input'); const form=document.getElementById('search-form');
  const q=new URLSearchParams(location.search).get('q')||''; input.value=q; searchMovies(q);
  form.addEventListener('submit',e=>{e.preventDefault(); const value=input.value.trim(); history.replaceState({},'',`/search?q=${encodeURIComponent(value)}`); searchMovies(value);});
});
