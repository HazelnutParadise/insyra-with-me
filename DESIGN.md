# DESIGN: Insyra With Me

## Branch check (2026-11-04)
- `HazelnutParadise/insyra-website`: only `main` exists (`git ls-remote --heads` shows no `dev`). The local copy `/workspace/insyra-site` is at `origin/main` 8096701 (2026-11-01). **Site styles fall back to main** (no dev branch to read).
- `HazelnutParadise/insyra`: a `dev` branch exists (e214f5c). The logo files and `Docs/docs.css` come from **dev**. That repo has no site CSS theme. `internal/palette` is not on dev (the `internal/` folder has algorithms, ccl, core, csv, excelsheet, reftest, utils).

## Palette: brand colours only
| CSS variable | Hex | Source |
|---|---|---|
| `--brand-blue-logo` | `#21449B` | insyra **dev** `logo/logo_transparent.png`, most common opaque blue pixel (12,008 px. #22459C has 12,493 px and is essentially the same colour.) The icon `logo/logo_icon_transparent_256.png` is #1E4398–#1F4398. The site's theme.css comment calls the brand blue `#1F449B`. |
| `--brand-orange-logo` | `#F6AB42` | insyra **dev** `logo/logo_transparent.png`, most common orange pixel (12,759 px). theme.css comment: `#F9AC41`. |
| `--brand-blue` | `#2550B0` | insyra-website **main** `frontend/src/theme.css` `--insyra-blue` ("tuned for legibility") |
| `--brand-orange` | `#EE9A2C` | same file, `--insyra-orange` |
| `--brand-cream` | `#FFF4E6` | same file, `--insyra-cream` ("brand background colour") |

Neutrals, all of which also appear in insyra-website main `theme.css`: `#FFFFFF` (white), `#F5F5F5` (gray-96), `#E0E0E0` (gray-88), `#555555` (gray-33), `#333333` (gray-20), `#242424` (gray-14b), `#1A1A1A` (gray-10a), `#000000` (black).

### Light and dark roles (`src/styles/global.css`)
- **Light:** white background, cream footer and blockquotes, #333 text, #555 muted text, #E0E0E0 borders. Links use #2550B0 and accents #EE9A2C. The hero uses #21449B with white text and #F6AB42 highlights.
- **Dark (`prefers-color-scheme`):** #1A1A1A background, #242424 surfaces and hero, #E0E0E0 text, #333 borders. Links and accents use #F6AB42, because the brand blue on #1A1A1A is too dark to read.
- **Exception:** code highlighting uses Shiki's `github-light` and `github-dark` themes, so token colours inside code blocks are not brand colours. The code-block frame and language label do use brand colours. If Tim wants code blocks in brand colours too, that needs a custom Shiki theme (not done).

## Fonts
- Body: `Inter, system-ui, Avenir, Helvetica, Arial, sans-serif`, from insyra-website main `frontend/src/style.css` line 2.
- Headings: `Space Grotesk`, from main `frontend/src/views/HowToUse.vue:198` and `Idensyra.vue:229`.
- Code: `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`, from main `frontend/src/views/Syralit.vue:337`.
- The official site's `index.html` loads no web-font link (only Font Awesome 4.7), so Inter and Space Grotesk show only if the visitor has them installed. This blog self-hosts both through `@fontsource-variable/inter` and `@fontsource-variable/space-grotesk`, so they look the same everywhere.

## Home hero (revised 2026-11-05)
- **H1:** the brand text "Insyra / With Me" is the page's only `<h1>`. It is set in Space Grotesk 700 at `clamp(3.4rem, 11vw, 9.5rem)`, with line-height .88 and tight tracking. "Insyra" is `#21449B` on light and `#FFFFFF` on dark. "With Me" is `#EE9A2C` on light and `#F6AB42` on dark.
- **Subtitle and lead:** the subtitle reads "Guides, stories and news from the Insyra community." The lead text describes the guides, use cases, community, ecosystem, resources, events and release news.
- **Background:** cream `#FFF4E6` on light, `#1A1A1A` on dark. An inline SVG sits behind the content:
  - a large circle in `#21449B` (`#2550B0` at 55% opacity on dark)
  - a circle in `#F6AB42`
  - two diagonal bars in `#EE9A2C`, echoing the slashes in the logo
  - a dot grid in `#2550B0` (`#F6AB42` on dark)
- **Motif** (replaces the white logo tile):
  - A code card on `#1A1A1A` with a `#242424` title bar holds the README's DataTable snippet. Window dots are `#F6AB42`, `#FFF4E6` and `#2550B0`. Function names are `#F6AB42`, strings `#FFF4E6` and numbers `#EE9A2C`.
  - Overlapping it is a white table card with a `#21449B` header and a `#FFF4E6` striped row. It shows the snippet's data: Alice 28, Bob 34, and Charlie 29 faded.
  - On screens up to 900px wide the motif stacks under the text.
- **Category grid:** cards with top borders alternating between `#21449B` and `#F6AB42`.
- **Header:** a second row lists the five categories on a `#FFF4E6` background (`#242424` on dark).
- **OG image:** `public/og-default.png` uses the same elements on cream.
- **Colours:** none were added. Only the five brand colours and the neutrals listed above are used. Shadows are `rgba(0,0,0,.2–.28)`, which is black with alpha.

## Character
- The oversized brand H1 with geometric brand shapes and the code and table motif. The logo tile was removed.
- An orange rule under the header, and cards with an orange left edge.
- Tag pills, a sticky table of contents on screens at least 1100px wide, and `#` heading anchors.
- Code blocks show a language label and a copy button.
