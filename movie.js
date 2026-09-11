const DEMO = {
  'crimson-harbor': {title:'Crimson Harbor',slug:'crimson-harbor',type:'movie',year:2026,language:'English',genre:'Action, Thriller',quality:'WEB-DL',duration:'2h 08m',imdb_rating:'8.1',country:'Fictional',director:'Demo Director',cast:'Demo Cast',description:'A fictional sample record used to preview the FilmParadise BD interface before the D1 database is connected.',poster_url:'/assets/images/poster-crimson.svg',download_url_1:'',download_url_2:'',download_url_3:''},
  'monsoon-letters': {title:'Monsoon Letters',slug:'monsoon-letters',type:'movie',year:2025,language:'Bangla',genre:'Drama, Romance',quality:'1080p',duration:'1h 54m',imdb_rating:'7.6',country:'Fictional',director:'Demo Director',cast:'Demo Cast',description:'A fictional sample record for layout testing. Replace it with your own authorized catalog entry from the admin panel.',poster_url:'/assets/images/poster-monsoon.svg',download_url_1:'',download_url_2:'',download_url_3:''}
};

function detailTemplate(m) {
  const title = FP.esc(m.title);
  const poster = FP.esc(FP.posterUrl(m));
  const link = (url, cls, label) => url ? `<a class="btn ${cls}" href="${FP.esc(url)}" target="_blank" rel="noopener noreferrer">${label}</a>` : `<button class="btn ${cls}" disabled>${label} — Configure</button>`;
  return `<div class="detail-poster"><img src="${poster}" alt="${title} poster" onerror="this.onerror=null;this.src='/assets/images/poster-placeholder.svg'"></div>
    <div class="detail-copy">
      <span class="eyebrow">${String(m.type)==='series'?'WEB SERIES':'MOVIE'}</span>
      <h1>${title}</h1>
      <div class="detail-sub">${FP.esc(m.year||'')} • ${FP.esc(m.language||'')} • ${FP.esc(m.quality||'')}</div>
      <div class="meta-grid">
        <div class="meta-item"><small>Genre</small><strong>${FP.esc(m.genre||'—')}</strong></div>
        <div class="meta-item"><small>Duration</small><strong>${FP.esc(m.duration||'—')}</strong></div>
        <div class="meta-item"><small>IMDb</small><strong>${FP.esc(m.imdb_rating||'—')}</strong></div>
        <div class="meta-item"><small>Country</small><strong>${FP.esc(m.country||'—')}</strong></div>
        <div class="meta-item"><small>Director</small><strong>${FP.esc(m.director||'—')}</strong></div>
        <div class="meta-item"><small>Cast</small><strong>${FP.esc(m.cast||'—')}</strong></div>
      </div>
      <div class="description"><h2>About this title</h2><p>${FP.esc(m.description||'No description available.')}</p></div>
      <div class="download-box"><h2>Download options</h2><p class="muted" style="margin:0 0 10px;font-size:.8rem">Only use links for content you are authorized to distribute.</p><div class="download-actions">
        ${link(m.download_url_1,'primary','Download Server 1')}
        ${link(m.download_url_2,'green','Download Server 2')}
        ${link(m.download_url_3,'blue','Download Server 3')}
      </div></div>
    </div>`;
}

async function loadMovie() {
  const state = document.getElementById('movie-state');
  const detail = document.getElementById('movie-detail');
  const slug = new URLSearchParams(location.search).get('slug');
  if (!slug) { state.innerHTML = `<div class="state-card"><h2>Movie not specified</h2><p class="muted">Use the search page to browse the catalog.</p><a class="btn primary" href="/search">Browse titles</a></div>`; return; }
  try {
    const data = await FP.api('/api/movies/' + encodeURIComponent(slug));
    document.title = `${data.item.title} — FilmParadise BD`;
    document.getElementById('meta-description').setAttribute('content', (data.item.description || '').slice(0,155));
    document.getElementById('og-title').setAttribute('content', data.item.title);
    document.getElementById('og-description').setAttribute('content', (data.item.description || '').slice(0,155));
    detail.innerHTML = detailTemplate(data.item); detail.classList.remove('hidden'); state.innerHTML='';
  } catch (err) {
    const item = DEMO[slug];
    if (item) { detail.innerHTML = detailTemplate(item); detail.classList.remove('hidden'); state.innerHTML='<p class="notice">Preview mode: D1 is not connected yet. This is a fictional sample record.</p>'; return; }
    state.innerHTML = `<div class="state-card"><h2>Title not found</h2><p class="muted">${FP.esc(err.message)}</p><a class="btn primary" href="/">Back to home</a></div>`;
  }
}
document.addEventListener('DOMContentLoaded', loadMovie);
