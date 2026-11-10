# Deploy plan (not deployed)

Local prep only. Nothing has been pushed, published, or changed in a Cloudflare or GitHub account.

The public site will be the **root** of `https://insyra.me` (already set as `SITE_URL` in `src/site.config.ts`). Canonical URLs, Open Graph, JSON-LD, the sitemap, RSS and `robots.txt` all follow that constant. Astro `site` is `https://insyra.me` with `base` `/`.

**Host: Cloudflare Pages** (free static hosting). The domain is already registered at Cloudflare, so the zone and nameservers are already on Cloudflare. When Tim adds `insyra.me` as a Pages custom domain, Cloudflare creates the DNS records automatically (apex CNAME flattening). No GitHub Pages `CNAME` file or Actions workflow is used.

## Build settings for Pages

| Setting | Value |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build:prod` |
| Build output directory | `dist` |
| Root directory | `/` (repo root) |
| Node | `NODE_VERSION=24` (also pinned in `.node-version`; local builds used v24.22.1) |

`wrangler.toml` names the project `insyra-with-me` and sets `pages_build_output_dir = "./dist"`. It does not deploy by itself. `public/_headers` already sets long cache on `/_astro/*` (hashed assets). Astro emits `dist/404.html`, which Pages uses for unknown routes.

## What Tim would click in Cloudflare (login required; not done)

These steps need Tim's Cloudflare login (or a connected Cloudflare connector). Do not run them until he asks to go live.

1. **Create the Pages project** (Workers & Pages → Create → Pages):
   - **Option A — Git:** connect the GitHub repo once it exists under HazelnutParadise, set the table above, production branch `main` (or whatever is agreed). Later pushes to that branch auto-deploy; pull requests get preview URLs. *Creating or pushing the repo is also Tim's action.*
   - **Option B — Direct Upload:** from this machine, after `npx wrangler login` (Tim's account) and `npm run build:prod`, run `npx wrangler pages deploy dist --project-name insyra-with-me`. Do not run this without his login and an explicit go-live request.
2. **Custom domains:** open the project → Custom domains → Set up a domain → add **`insyra.me`**. Confirm the DNS record Cloudflare proposes for the apex (a flattened CNAME to `<project>.pages.dev`). Status should become Active; HTTPS is issued automatically.
3. **Optional www:** add **`www.insyra.me`** the same way, then Rules → Redirect Rules: `www.insyra.me/*` → `https://insyra.me/${1}`, 301, keep the query string. Canonicals already use the apex (`SITE_URL`).
4. **SSL:** with the domain on Cloudflare, Universal SSL applies. Turn on Always Use HTTPS if it is not already on.
5. No TXT verification record is required for Pages when the zone is already on this Cloudflare account. Do not add wildcard DNS records.

## DNS records

Because `insyra.me` is registered at Cloudflare, Tim should **not** add apex A/AAAA records at another registrar. After step 2, check DNS → Records and confirm Cloudflare created something equivalent to:

| Type | Name | Content | Notes |
| --- | --- | --- | --- |
| CNAME (flattened) | `@` | `<project>.pages.dev` | Created by Pages when the apex custom domain is added. Exact target is the project subdomain, unknown until the project exists. |
| CNAME | `www` | `<project>.pages.dev` | Only if Tim also attaches `www.insyra.me`. Then add the 301 redirect above. |

If those records do not appear, add them in the Cloudflare DNS UI for this zone (still Tim's login). No nameserver change is needed; the domain is already on Cloudflare.

## After go-live (later)

1. Search Console / analytics are Tim's choice.
2. Moving into the official site at `/blog` later is described in earlier notes: change `SITE_URL`, set a `/blog` base, and 301 from `insyra.me`. Do not do this now. Do not touch the official site.

## Local non-production preview

`scripts/serve-preview.mjs` serves `dist/` with `X-Robots-Tag: noindex, nofollow` and a disallow-all `/robots.txt`. A temporary `cloudflared` quick tunnel (`trycloudflare.com`, no account) can expose that preview. It is not the live site.
