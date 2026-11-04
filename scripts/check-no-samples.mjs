// Fails if any `sample: true` post made it into dist/ (pages, RSS, sitemap, JSON-LD, links).
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
const root = 'src/content/posts', dist = 'dist';
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const samples = walk(root).filter((f) => f.endsWith('.md') && /^sample:\s*true\s*$/m.test(readFileSync(f, 'utf8').split(/^---$/m)[1] ?? ''))
  .map((f) => relative(root, f).replace(/\.md$/, '').split('/').slice(1).join('/'));
if (!existsSync(dist)) { console.error('check-no-samples: dist/ missing, run the build first'); process.exit(1); }
const files = walk(dist).filter((f) => /\.(html|xml|json)$/.test(f));
const hits = [];
for (const slug of samples) {
  if (existsSync(join(dist, 'posts', slug))) hits.push(`page dist/posts/${slug}/`);
  for (const f of files) if (readFileSync(f, 'utf8').includes(`/posts/${slug}/`)) hits.push(`${slug} referenced in ${f}`);
}
if (hits.length) { console.error(`check-no-samples: FAIL, ${hits.length} sample leak(s):\n  ` + hits.join('\n  ')); process.exit(1); }
console.log(`check-no-samples: OK (${samples.length} sample posts, none published)`);
