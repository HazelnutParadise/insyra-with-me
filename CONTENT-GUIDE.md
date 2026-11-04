# Content guide

## Add a post
1. Create `src/content/posts/en/<slug>.md`. The URL becomes `/posts/<slug>/`.
2. Later, zh-TW posts go in `src/content/posts/zh-tw/<slug>.md` and get the URL `/zh-tw/posts/<slug>/`. That needs a `src/pages/zh-tw/posts/[...slug].astro` route calling `getPosts('zh-tw')`, which is not built yet. English URLs stay the same.
3. Run `npm run dev` to preview, and `npm run build` before you publish.

## Frontmatter
```yaml
---
title: "Post title"              # required
description: "One-sentence summary, used for meta description, OG and RSS"  # required
pubDate: 2026-11-04              # required
updatedDate: 2026-11-10          # optional
tags: ["datatable", "tutorial"]  # optional; each tag gets /tags/<tag>/
cover: ../../../assets/posts/my-cover.png  # optional; also used as the OG image
coverAlt: "What the cover shows"  # give this whenever you set cover
draft: false                     # true = shown only in `npm run dev`, never built
---
```
If a post has no `cover`, its OG image falls back to `/og-default.png` (`public/og-default.png`).

## Images and screenshots
Put files in `src/assets/posts/`. Astro optimizes them to WebP with width and height set. From a post, link them with a relative path:
```md
![Alt text describing the screenshot](../../../assets/posts/shot.png "Caption shown under the image")
```
An image alone in its paragraph that has a title becomes `<figure>` plus `<figcaption>`. Always write real alt text.

## Drafts
Set `draft: true`. The post then stays out of the build, the posts list, tags, RSS and the sitemap.

## Code
Use fenced code blocks with a language (```go, ```sh). The language label and copy button are added automatically.

## Site URL
Change `SITE_URL` in `src/site.config.ts`. Canonical URLs, OG, JSON-LD, the sitemap, RSS and robots.txt all follow it.
