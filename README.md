# Insyra With Me

Community blog for [Insyra](https://insyra.hazelnut-paradise.com), the Go data analysis library. The production site is [insyra.me](https://insyra.me).

## Stack

Astro (static site), TypeScript, Markdown content collections.

## Build

```sh
npm install
npm run dev          # local preview
npm run build:prod   # production build (excludes sample posts)
```

Output directory: `dist/`.

## Deploy

[Cloudflare Pages](https://developers.cloudflare.com/pages/). Recommended settings:

- Build command: `npm run build:prod`
- Output directory: `dist`
- Environment: `NODE_VERSION=24`

See DEPLOY.md for the full launch notes.
