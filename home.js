

async function loadHome() {
  const recent = document.getElementById('recent-grid');
  const featured = document.getElementById('featured-grid');
  recent.innerHTML = Array.from({length:10},()=>'<div class="skeleton"></div>').join('');
  featured.innerHTML = Array.from({length:5},()=>'<div class="skeleton"></div>').join('');
  try {
    const data = await FP.api('/api/movies/recent?limit=10');
    FP.renderGrid(recent, data.items, 'No published titles yet.');
    const featuredData = await FP.api('/api/movies?featured=1&limit=5');
    FP.renderGrid(featured, featuredData.items, 'No featured titles yet.');
  } catch (err) {
    FP.renderGrid(recent, FP.demoMovies.slice().sort((a,b)=>b.id-a.id), 'No demo titles.');
    FP.renderGrid(featured, FP.demoMovies.slice(0,5), 'No featured titles.');
  }
  document.getElementById('quick-links').innerHTML = [
    ['🔥 Trending','/search?q='],['⭐ Featured','/search?q='],['🎬 Movies','/category?slug=movie'],['📺 Series','/web-series']
  ].map(([t,u])=>`<a class="quick-chip" href="${u}">${t}</a>`).join('');
}

document.addEventListener('DOMContentLoaded', loadHome);
