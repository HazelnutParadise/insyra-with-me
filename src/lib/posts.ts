import { getCollection, type CollectionEntry } from 'astro:content';
export type Post = CollectionEntry<'posts'>;
export const langOf = (p: Post) => p.id.split('/')[0];
export const slugOf = (p: Post) => p.id.split('/').slice(1).join('/');
export const urlOf = (p: Post) => (langOf(p) === 'en' ? `/posts/${slugOf(p)}/` : `/${langOf(p)}/posts/${slugOf(p)}/`);
export async function getPosts(lang = 'en') {
  const all = await getCollection('posts', (p) => langOf(p) === lang && (import.meta.env.DEV || !p.data.draft));
  return all.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
export const readingTime = (body = '') => Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 220));
export const tagSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

export const CATEGORIES = [
  { slug: 'guides', name: 'Guides & Use Cases', blurb: 'How to do things with Insyra, plus worked examples on real data.' },
  { slug: 'community', name: 'Community & Stories', blurb: 'People and teams using Insyra, in their own words.' },
  { slug: 'ecosystem', name: 'Ecosystem', blurb: 'Projects around Insyra, such as Idensyra and Syralit.' },
  { slug: 'resources-events', name: 'Resources & Events', blurb: 'Talks, workshops, links and learning material.' },
  { slug: 'releases', name: 'Release News', blurb: 'What is new in each Insyra release.' },
] as const;
export type CategorySlug = (typeof CATEGORIES)[number]['slug'];
export const categoryOf = (slug: string) => CATEGORIES.find((c) => c.slug === slug)!;
