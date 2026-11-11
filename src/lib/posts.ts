import { getCollection, type CollectionEntry } from 'astro:content';
export type Post = CollectionEntry<'posts'>;
export const langOf = (p: Post) => p.id.split('/')[0];
export const slugOf = (p: Post) => p.id.split('/').slice(1).join('/');
export const urlOf = (p: Post) => (langOf(p) === 'en' ? `/posts/${slugOf(p)}/` : `/${langOf(p)}/posts/${slugOf(p)}/`);
// Sample posts (frontmatter `sample: true`) are included unless INCLUDE_SAMPLES=false.
// `npm run build:prod` sets INCLUDE_SAMPLES=false. SAMPLE_LIMIT=<n> keeps only the n newest
// samples (used to preview sparse layouts; never needed in normal work).
const env = (typeof process !== 'undefined' ? process.env : {}) as Record<string, string | undefined>;
export const INCLUDE_SAMPLES = env.INCLUDE_SAMPLES !== 'false';
const SAMPLE_LIMIT = env.SAMPLE_LIMIT !== undefined ? Number(env.SAMPLE_LIMIT) : Infinity;
export async function getPosts(lang = 'en') {
  const all = (await getCollection('posts', (p) => langOf(p) === lang && !p.data.draft && (INCLUDE_SAMPLES || !p.data.sample)))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  let samples = 0;
  return all.filter((p) => !p.data.sample || ++samples <= SAMPLE_LIMIT);
}
export const readingTime = (body = '') => Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 220));
export const tagSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

export const CATEGORIES = [
  { slug: 'guides', name: 'Guides & Use Cases', blurb: 'How to do things with Insyra, plus worked examples on real data.' },
  { slug: 'community', name: 'Community & Stories', blurb: 'People and teams using Insyra, in their own words.' },
  { slug: 'ecosystem', name: 'Ecosystem', blurb: 'Projects around Insyra, such as Syralit, for interactive data apps in Go.' },
  { slug: 'resources-events', name: 'Resources & Events', blurb: 'Talks, workshops, links and learning material.' },
  { slug: 'releases', name: 'Release News', blurb: 'What is new in each Insyra release.' },
] as const;
export type CategorySlug = (typeof CATEGORIES)[number]['slug'];
export const categoryOf = (slug: string) => CATEGORIES.find((c) => c.slug === slug)!;

/** Categories that have at least one published post, in CATEGORIES order. Empty ones are never linked or built. */
export async function activeCategories(lang = 'en') {
  const used = new Set((await getPosts(lang)).map((p) => p.data.category));
  return CATEGORIES.filter((c) => used.has(c.slug));
}
