import { siteUrl } from '../data/site.js';

/**
 * The admin panel is also `noindex`ed in BaseLayout — the Disallow here only
 * stops the crawl, and a page that is merely disallowed can still be indexed
 * from a link elsewhere. Both are needed.
 */
export function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    '',
    '# Photos are a real discovery channel for a decoration business.',
    'User-agent: Googlebot-Image',
    'Allow: /images/',
    '',
    `Sitemap: ${new URL('/sitemap.xml', siteUrl).toString()}`,
    ''
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
}
