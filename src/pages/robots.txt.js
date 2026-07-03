import { siteUrl } from '../data/site.js';

export function GET() {
  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', siteUrl).toString()}\n`,
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    }
  );
}
