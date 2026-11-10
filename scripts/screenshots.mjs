import { chromium } from 'playwright';
const base = process.env.BASE ?? 'http://localhost:4329';
const shots = [
  ['home', '/', 1280, 900], ['home-mobile', '/', 390, 844], ['posts', '/posts/', 1280, 900], ['posts-mobile', '/posts/', 390, 844],
];
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
for (const scheme of ['light', 'dark']) {
  for (const [name, path, w, h] of shots) {
    const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1 });
    const page = await ctx.newPage();
    await page.goto(base + path, { waitUntil: 'networkidle' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) console.log(`horizontal overflow ${overflow}px on ${name}-${scheme}`);
    await page.screenshot({ path: `screenshots/${name}-${scheme}.png`, fullPage: true });
    await ctx.close();
  }
}
await browser.close();
