import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './src/site.config.ts';
import rehypeFigure from './src/lib/rehype-figure.mjs';

export default defineConfig({
  site: SITE_URL,
  base: '/',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', 'zh-tw': 'zh-Hant-TW' } },
    // add x-default (the English page) to every hreflang pair
    serialize(item) { const en = item.links?.find((l) => l.lang === 'en'); return en && item.links.length > 1 ? { ...item, links: [...item.links, { lang: 'x-default', url: en.url }] } : item; } })],
  markdown: {
    rehypePlugins: [rehypeFigure],
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false },
  },
});
