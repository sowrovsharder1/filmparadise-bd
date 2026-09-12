# FilmParadise BD

A lightweight movie & web-series catalog built for Cloudflare Pages + Pages Functions + D1 + R2.

## Important
This code is designed for content you are legally authorized to publish. The site stores metadata, posters and external URLs only; it does not host movie/video files.

## Architecture
- Static frontend: HTML/CSS/vanilla JS
- Serverless API: Cloudflare Pages Functions (`/functions`)
- Database: Cloudflare D1 (`DB` binding)
- Poster storage: Cloudflare R2 (`POSTERS` binding)
- Hosting/deploy: GitHub + Cloudflare Pages

Cloudflare Pages Functions use file-based routing from the `/functions` directory, so routes are generated from the folder/file structure.

## 1. GitHub + Pages
Your GitHub repository should be connected to the existing Cloudflare Pages project.
Push/commit the files in this repository. Cloudflare Pages will rebuild the site from the connected Git repository.

## 2. Create the D1 database
In Cloudflare Dashboard:
1. Workers & Pages / Storage & Databases → D1.
2. Create a database, e.g. `filmparadise-db`.
3. Open the database and run these SQL files in order:
   - `migrations/0001_initial.sql`
   - `migrations/0002_seed_categories.sql`

If you have Wrangler locally, the same migrations can be applied with your preferred D1 migration workflow.

## 3. Bind D1 to the Pages project
Open the Pages project → Settings → Functions → bindings (the exact sidebar wording may vary).
Add a D1 database binding:
- Variable name / Binding: `DB`
- Database: `filmparadise-db`

The frontend API expects exactly the binding name `DB`.

## 4. Create the R2 bucket
In Cloudflare Dashboard:
1. R2 → Create bucket.
2. Suggested bucket name: `filmparadise-posters`.

## 5. Bind R2 to the Pages project
In the Pages project Functions bindings:
- Binding name: `POSTERS`
- R2 bucket: `filmparadise-posters`

The poster API keeps the bucket private and serves posters through `/api/posters/...`.

## 6. Configure Admin credentials
Set these as Cloudflare secrets/environment values for the Pages Functions project:
- `ADMIN_PASSWORD` — your strong admin password
- `ADMIN_USERNAME` — optional; defaults to `admin`
- `SESSION_SECRET` — strongly recommended random secret used to sign the admin session; if omitted, `ADMIN_PASSWORD` is used as the signing secret.

Never put the password or session secret in frontend JavaScript or GitHub source.

## 7. Admin login
Open:
`/admin/login`

Default username is `admin` unless you set `ADMIN_USERNAME`.

After login, use:
`/admin`

## 8. Add a title
Admin → Add title.

Fill in:
- title
- movie/series type
- year
- language
- genre
- quality
- duration
- IMDb rating
- country
- director
- cast
- description
- category/categories
- poster
- 3 external download URLs
- featured/pinned/status

Publishing a title automatically makes it available to the public catalog.

## 9. Poster uploads
The admin upload endpoint accepts JPG, PNG and WEBP images up to 5 MB. Files are placed in R2 under a date-based key.

## 10. Custom domain
You can later add your own domain in the Cloudflare Pages project settings. The current site works on the `*.pages.dev` address without a custom domain.

## 11. SEO
The static pages include basic metadata, robots.txt and a starter sitemap. Update `sitemap.xml` when you move to a custom domain or replace it with a dynamic sitemap function.

## 12. Local development
For local development with Wrangler, use the Cloudflare Pages development workflow and make sure your local bindings/secrets are configured. The project does not require a traditional Node server.

## 13. Troubleshooting
### Homepage shows preview cards
That means the D1 API is unavailable. Check the `DB` binding and that both SQL migration files ran successfully.

### Admin login says secret is not configured
Set `ADMIN_PASSWORD` as a Cloudflare secret and redeploy.

### Poster upload says R2 is not configured
Add the R2 binding named `POSTERS` and redeploy.

### Movie cards show but detail page says not found
Make sure the title is `published` and has a unique slug. The admin API creates the slug automatically.
