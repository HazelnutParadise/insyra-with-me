import type { APIContext } from 'astro';
export function GET(_context: APIContext) {
  return new Response(`User-agent: *\nDisallow: /\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
