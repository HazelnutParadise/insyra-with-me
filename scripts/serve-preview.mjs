// Local preview of dist/ with X-Robots-Tag: noindex. Not for production.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
const root = resolve('dist');
const port = Number(process.env.PORT || 4330);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };
const headers = { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' };
const robots = 'User-agent: *\nDisallow: /\n';
const server = createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1');
  if (url.pathname === '/robots.txt') { res.writeHead(200, { ...headers, 'Content-Type': types['.txt'] }); res.end(robots); return; }
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = normalize(join(root, rel));
  if (!file.startsWith(root + sep) && file !== root) { res.writeHead(403, headers); res.end('Forbidden'); return; }
  const send = (p, code = 200) => { const body = readFileSync(p); res.writeHead(code, { ...headers, 'Content-Type': types[extname(p)] || 'application/octet-stream' }); res.end(body); };
  if (existsSync(file) && statSync(file).isFile()) return send(file);
  const asDir = join(file, 'index.html');
  if (existsSync(asDir) && statSync(asDir).isFile()) return send(asDir);
  const notFound = join(root, '404.html');
  if (existsSync(notFound)) return send(notFound, 404);
  res.writeHead(404, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Not found');
});
server.listen(port, '127.0.0.1', () => console.log(`preview http://127.0.0.1:${port} (noindex)`));
