import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Posts live in src/content/posts/<lang>/<slug>.md. English = "en"; add "zh-tw" later.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      category: z.enum(['guides', 'community', 'ecosystem', 'resources-events', 'releases']),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      // optional FAQPage JSON-LD; answers must be text already in the post body
      faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      draft: z.boolean().default(false),
      // true = placeholder/sample content; excluded when INCLUDE_SAMPLES=false (npm run build:prod)
      sample: z.boolean().default(false),
    }),
});
export const collections = { posts };
