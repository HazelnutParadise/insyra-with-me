import { chromium } from 'playwright';
const base = process.env.BASE ?? 'http://localhost:4329';
const pages = { home: '/', posts: '/posts/', post: '/posts/sample-install-insyra/' };
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  for (const [name, path] of Object.entries(pages)) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `screenshots/${name}-${scheme}.png`, fullPage: true });
  }
  if (scheme === 'light') console.log('copy buttons:', await page.locator('.copy-btn').count(), 'labels:', await page.locator('.code-bar .lang').allTextContents());
  await ctx.close();
}
await browser.close();
