# Insyra With Me

The Insyra community blog (Astro, static). `npm install`, then `npm run dev`. Docs: DESIGN.md, CONTENT-GUIDE.md, SEO-CHECKLIST.md, DEPLOY.md.

The planned public URL is `https://insyra.me` (site constant in `src/site.config.ts`). The site is not live yet.

## Builds

- `npm run build`: local/dev build. Sample posts (`sample: true`) are included if any exist.
- `npm run build:prod`: production build (`INCLUDE_SAMPLES=false`) plus a check that fails if any sample would be published. This is the Cloudflare Pages build command.
- There are currently no posts in the repo (sample placeholders were removed before launch prep). Add a real post with `draft: false` and no `sample: true`. See CONTENT-GUIDE.md.
