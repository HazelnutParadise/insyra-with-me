# Content guide: Insyra With Me

Insyra With Me is the blog for the Insyra community and ecosystem. It covers how-to guides and use cases, community and user stories, ecosystem projects, resources and events, and release news. SEO is one of its goals, but not the only one.

## Categories (`category` field, required; page at `/category/<slug>/`)
| slug | Name | Use it for |
|---|---|---|
| `guides` | Guides & Use Cases | How to do X with Insyra, and worked examples on real data |
| `community` | Community & Stories | Real people and teams, published only with their permission and their facts |
| `ecosystem` | Ecosystem | Idensyra, Syralit and other projects around Insyra (facts from their repos) |
| `resources-events` | Resources & Events | Talks, workshops, meetups, learning links |
| `releases` | Release News | One post per notable release, based on the GitHub release notes |

The categories are defined in `src/lib/posts.ts` (`CATEGORIES`) and in `src/content.config.ts` (the zod enum). Change both together.

## Add a post
1. Create `src/content/posts/en/<slug>.md`. The URL becomes `/posts/<slug>/`, and a slug must never change after it is published.
2. Later, zh-TW posts go in `src/content/posts/zh-tw/<slug>.md` and get the URL `/zh-tw/posts/<slug>/`. That route is not built yet.
3. Preview with `npm run dev`, and run `npm run build` before you publish.

## Frontmatter
```yaml
---
title: "How to read a CSV in Go with Insyra"   # required
description: "One or two sentences, ~150 chars: meta description, OG and RSS"  # required
pubDate: 2026-11-04          # required
updatedDate: 2026-11-10      # optional
category: guides             # required: guides | community | ecosystem | resources-events | releases
tags: ["datatable", "csv"]   # optional, free keywords (shown, no own pages)
cover: ../../../assets/posts/my-cover.png   # optional; also the OG image (default /og-default.png)
coverAlt: "What the cover shows"
draft: false                 # true = only in `npm run dev`, never built, not in RSS or sitemap
---
```

## Images
Put files in `src/assets/posts/` and link them with `![alt](../../../assets/posts/x.png "Caption")`. An image with a title becomes a `<figure>` with a caption. Always write real alt text.

## Templates

### Guides & Use Cases
```md
## Goal
What the reader will be able to do.
## Prerequisites
Go version, Insyra installed (link the install guide).
## Step 1: ...
Explain, then a code block (```go). Use only APIs that exist in the README or docs.
## Expected result
What they should see. Add a real screenshot, and never invent output.
## Next steps
Links to related posts and the official docs page.
```

### Community & Stories
Start from `community-story-template.md`. Use only facts and numbers the person gives, and get their approval before you publish.
```md
## Who
## The problem
## Why Insyra
## How they did it
## Result
## Links
```

### Ecosystem
```md
## What it is            (one paragraph, from the project's README)
## Key features          (bullets from the README, with the README linked)
## How it works with Insyra
## Where to get it       (repo, official site section)
```

### Resources & Events
```md
## What / When / Where   (date with time zone, online or venue)
## Who it is for
## Links                 (registration, slides, recording)
```

### Release News
```md
## Highlights            (from the GitHub release notes, with the release linked)
## Breaking changes
## Upgrade               (go get command)
```

## SEO notes
- Write the title for what people search for, in the form "How to [task] in Go with Insyra", for example "How to read a CSV in Go with Insyra". Put the main keyword near the start and stay under about 60 characters (a guideline, not a hard rule).
- Write a unique `description` that matches the title.
- Use one `#` heading per page; the title is the H1, so start the body at `##`. Make headings descriptive, because they feed the table of contents.
- Link to related posts and to the official docs (https://hazelnutparadise.github.io/insyra/), the DataList and DataTable docs, and the official site in every guide.
- Code must be copyable and real. Check every API against the README or docs.
- Never invent numbers, benchmarks or user quotes.
- Never rename a published slug. If you have to, add a 301 (see DEPLOY.md).

## Sample posts and drafts

- Placeholder or sample posts carry `sample: true` in their frontmatter. All 5 current posts are samples.
- `npm run dev` and `npm run build` include samples (`INCLUDE_SAMPLES` defaults to true).
- **`npm run build:prod`** sets `INCLUDE_SAMPLES=false`, which removes samples from pages, category pages, RSS, sitemap and JSON-LD. It then runs `scripts/check-no-samples.mjs`, which fails the build if any sample slug appears anywhere in `dist/`.
- **Simple alternative:** set `draft: true`. Drafts are never published, in any build.
- **To publish a real post:** remove `sample: true` (or set it to false) and keep `draft: false`.
- **Layout previews only:** `SAMPLE_LIMIT=<n> npm run build` keeps just the n newest samples, for checking the 1-post or 2-post layouts. Never ship it.
- **Categories:** a category appears in the nav, on the home page, as a page and in the sitemap only once it has a published post. You don't need to do anything to enable one.
