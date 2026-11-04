import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, urlOf } from '../lib/posts';
import { SITE } from '../site.config';
export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({ title: SITE.name, description: SITE.description, site: context.site!,
    items: posts.map((p) => ({ title: p.data.title, description: p.data.description, pubDate: p.data.pubDate, link: urlOf(p), categories: p.data.tags })) });
}
