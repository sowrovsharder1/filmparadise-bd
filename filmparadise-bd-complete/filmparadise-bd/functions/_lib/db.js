const BASE_SELECT = `
  SELECT m.*, COALESCE(GROUP_CONCAT(c.name, '||'), '') AS category_names,
         COALESCE(GROUP_CONCAT(c.slug, '||'), '') AS category_slugs
  FROM movies m
  LEFT JOIN movie_categories mc ON mc.movie_id = m.id
  LEFT JOIN categories c ON c.id = mc.category_id`;

export function normalizeMovie(row) {
  if (!row) return null;
  const categories = String(row.category_names || '').split('||').filter(Boolean).map((name,i)=>({name,slug:String(row.category_slugs||'').split('||').filter(Boolean)[i]||''}));
  return {
    ...row,
    is_featured: Boolean(row.is_featured),
    is_pinned: Boolean(row.is_pinned),
    categories
  };
}

export { BASE_SELECT };

export function safeLimit(value, fallback=20, max=100) {
  const n = Number.parseInt(value,10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n,1),max);
}

export function safeOffset(value) {
  const n = Number.parseInt(value,10);
  return Number.isFinite(n) && n>0 ? n : 0;
}

export function slugify(input) {
  return String(input||'').trim().toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9\s-]/g,'').replace(/[\s_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,160);
}

export function cleanString(v,max=5000){return String(v??'').trim().slice(0,max)}

export function cleanBool(v){return v===true || v===1 || v==='1' || v==='true'}

export function validHttpUrl(value){
  if (!value) return '';
  try { const u = new URL(value); if (!['http:','https:'].includes(u.protocol)) return ''; return u.toString(); } catch { return ''; }
}
