import { urlOf, type Post } from './posts';

const env = (typeof process !== 'undefined' ? process.env : {}) as Record<string, string | undefined>;

/** Preview deploys (Cloudflare Pages branch builds) and local PUBLIC_PREVIEW=true. Never true on main. */
export const isPreview =
  env.PUBLIC_PREVIEW === 'true' ||
  (Boolean(env.CF_PAGES_BRANCH) && env.CF_PAGES_BRANCH !== 'main');

const PROD = 'https://insyra.me';
const LABEL = '未發布 / Unpublished';

export const UNPUBLISHED_LABEL = LABEL;

function normalizePath(path: string): string {
  const p = path.startsWith('http') ? new URL(path).pathname : path;
  return p.endsWith('/') ? p : `${p}/`;
}

function pathsFromSitemap(xml: string): Set<string> {
  const paths = new Set<string>();
  for (const m of xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)) {
    try {
      paths.add(normalizePath(m[1].trim()));
    } catch {
      /* skip malformed loc */
    }
  }
  return paths;
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(15_000),
    headers: { 'user-agent': 'insyra-with-me-preview-build' },
  });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.text();
}

async function loadLivePaths(): Promise<Set<string>> {
  try {
    return pathsFromSitemap(await fetchText(`${PROD}/sitemap-0.xml`));
  } catch (first) {
    const index = await fetchText(`${PROD}/sitemap-index.xml`);
    const locs = [...index.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1].trim());
    if (locs.length === 0) throw first;
    const all = new Set<string>();
    for (const loc of locs) {
      for (const p of pathsFromSitemap(await fetchText(loc))) all.add(p);
    }
    return all;
  }
}

// null = sitemap fetch failed; show no per-post labels (build must not fail).
let livePaths: Promise<Set<string> | null> | undefined;

function getLiveProdPaths(): Promise<Set<string> | null> {
  if (!livePaths) {
    livePaths = loadLivePaths()
      .then((paths) => {
        console.log(`preview: loaded ${paths.size} live paths from insyra.me sitemap`);
        return paths;
      })
      .catch((err) => {
        console.warn('preview: failed to fetch insyra.me sitemap; skipping unpublished labels', err);
        return null;
      });
  }
  return livePaths;
}

/** True when this preview build should show the unpublished label for a post path. */
export async function isUnpublishedOnProd(path: string): Promise<boolean> {
  if (!isPreview) return false;
  const live = await getLiveProdPaths();
  if (!live) return false;
  return !live.has(normalizePath(path));
}

export async function isUnpublishedPost(post: Post): Promise<boolean> {
  return isUnpublishedOnProd(urlOf(post));
}
