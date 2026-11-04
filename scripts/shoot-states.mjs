// Usage: node scripts/shoot-states.mjs <label>  -> screenshots/states/home-<label>[-mobile]-light.png
import { chromium } from 'playwright';
const label = process.argv[2]; const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
for (const [suf, w, h] of [['', 1280, 900], ['-mobile', 390, 844]]) {
  const c = await b.newContext({ colorScheme: 'light', viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1 });
  const p = await c.newPage(); await p.goto('http://localhost:4329/', { waitUntil: 'networkidle' });
  const o = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (o > 0) console.log(label, suf, 'overflow', o);
  await p.screenshot({ path: `screenshots/states/home-${label}${suf}-light.png`, fullPage: true }); await c.close();
}
await b.close();
