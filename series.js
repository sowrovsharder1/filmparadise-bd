async function loadSeries(){
  const grid=document.getElementById('series-grid');grid.innerHTML=Array.from({length:8},()=>'<div class="skeleton"></div>').join('');
  try{const data=await FP.api('/api/movies?type=series&limit=40');FP.renderGrid(grid,data.items,'No published web series yet.')}
  catch(err){FP.renderGrid(grid,[],err.message)}
}
document.addEventListener('DOMContentLoaded',loadSeries);
