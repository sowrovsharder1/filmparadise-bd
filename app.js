const FP = (() => {
  const demoMovies = [
    {id:1,title:'Crimson Harbor',slug:'crimson-harbor',type:'movie',year:2026,language:'English',genre:'Action',quality:'WEB-DL',poster_url:'/assets/images/poster-crimson.svg',is_pinned:1},
    {id:2,title:'Monsoon Letters',slug:'monsoon-letters',type:'movie',year:2025,language:'Bangla',genre:'Drama',quality:'1080p',poster_url:'/assets/images/poster-monsoon.svg',is_pinned:1},
    {id:3,title:'The Last Signal',slug:'the-last-signal',type:'movie',year:2026,language:'Hindi',genre:'Thriller',quality:'WEB-DL',poster_url:'/assets/images/poster-signal.svg'},
    {id:4,title:'Neon Bazaar',slug:'neon-bazaar',type:'movie',year:2025,language:'Hindi',genre:'Comedy',quality:'HD',poster_url:'/assets/images/poster-neon.svg'},
    {id:5,title:'North Wind Files',slug:'north-wind-files',type:'series',year:2026,language:'English',genre:'Mystery',quality:'1080p',poster_url:'/assets/images/poster-north.svg'},
    {id:6,title:'River of Stars',slug:'river-of-stars',type:'series',year:2025,language:'Bangla',genre:'Romance',quality:'WEB-DL',poster_url:'/assets/images/poster-river.svg'}
  ];

  const categories = [
    ['Bangla','bangla','red'],['Hindi','hindi','red'],['Bollywood','bollywood','blue'],['Bangla Dub','bangla-dub','green'],
    ['Hindi Dub','hindi-dub','green'],['Dual Audio','dual-audio','purple'],['South Indian','south-indian','blue'],['Web Series','web-series','purple'],
    ['Action','action','red'],['Thriller','thriller','red'],['Horror','horror','red'],['Romance','romance','purple'],['Animation','animation','blue'],
    ['Comedy','comedy','yellow'],['Drama','drama','blue'],['K-Drama','k-drama','purple']
  ];

  function esc(value='') {
    return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function posterUrl(item) {
    return item.poster_url || '/assets/images/poster-placeholder.svg';
  }

  function movieCard(item) {
    const title = esc(item.title || 'Untitled');
    const year = item.year ? esc(item.year) : '—';
    const lang = esc(item.language || 'Unknown');
    const quality = esc(item.quality || 'HD');
    const type = String(item.type || 'movie') === 'series' ? 'SERIES' : 'MOVIE';
    const pin = item.is_pinned ? '<span class="badge">PINNED</span>' : '<span></span>';
    return `<a class="movie-card" href="/movie?slug=${encodeURIComponent(item.slug || '')}" aria-label="Open ${title}">
      <div class="poster-wrap">
        <img src="${esc(posterUrl(item))}" alt="${title} poster" loading="lazy" onerror="this.onerror=null;this.src='/assets/images/poster-placeholder.svg'">
        <div class="badges">${pin}<span class="badge quality">${quality}</span></div>
        <div class="poster-overlay">${lang}</div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${title}</h3>
        <div class="card-meta"><span>${year}</span><span>${type}</span></div>
      </div>
    </a>`;
  }

  async function api(path, options={}) {
    const res = await fetch(path, {headers:{'Accept':'application/json',...(options.body instanceof FormData ? {} : {'Content-Type':'application/json'})}, ...options});
    let data = null;
    try { data = await res.json(); } catch { data = {}; }
    if (!res.ok) {
      const error = new Error(data?.error || `Request failed (${res.status})`);
      error.status = res.status;
      throw error;
    }
    return data;
  }

  function renderShell() {
    const header = document.getElementById('site-header');
    if (header) {
      header.innerHTML = `<header class="site-header">
        <div class="container header-inner">
          <div class="brand-row">
            <a class="brand" href="/" aria-label="FilmParadise BD home">
              <span class="brand-mark">FP</span>
              <span class="brand-text"><strong>FilmParadise BD</strong><small>Movies • Series • Discovery</small></span>
            </a>
            <button class="menu-toggle" id="menu-toggle" type="button" aria-expanded="false">☰</button>
          </div>
          <nav class="main-nav" id="main-nav" aria-label="Main navigation">
            <a class="nav-link primary" href="/">HOME</a>
            <a class="nav-link" href="/category?slug=bangla">BANGLA</a>
            <a class="nav-link" href="/category?slug=hindi">HINDI</a>
            <a class="nav-link" href="/category?slug=bollywood">BOLLYWOOD</a>
            <a class="nav-link" href="/web-series">WEB SERIES</a>
            <a class="nav-link" href="/category?slug=action">ACTION</a>
          </nav>
          <div class="category-strip" aria-label="Categories">${categories.map(([name,slug,cls]) => `<a class="category-link ${cls}" href="/category?slug=${slug}">${name}</a>`).join('')}</div>
        </div>
      </header>`;
      document.getElementById('menu-toggle')?.addEventListener('click', () => {
        const nav = document.getElementById('main-nav');
        const open = nav.classList.toggle('open');
        document.getElementById('menu-toggle').setAttribute('aria-expanded', String(open));
      });
    }
    const footer = document.getElementById('site-footer');
    if (footer) footer.innerHTML = `<footer class="footer"><div class="container footer-inner"><div><strong>FilmParadise BD</strong><div>Original catalog UI for movies and web series.</div></div><div class="footer-links"><a href="/">Home</a><a href="/web-series">Web Series</a><a href="/search">Search</a><a href="/admin/login">Admin</a></div></div></footer>`;
  }

  function renderGrid(container, items, empty='No titles found.') {
    if (!container) return;
    if (!items?.length) {
      container.innerHTML = `<div class="state-card" style="grid-column:1/-1"><h3>${esc(empty)}</h3><p class="muted">Add published titles from the admin panel once D1 is connected.</p></div>`;
      return;
    }
    container.innerHTML = items.map(movieCard).join('');
  }

  return {categories, demoMovies, esc, posterUrl, movieCard, api, renderShell, renderGrid};
})();

document.addEventListener('DOMContentLoaded', FP.renderShell);
