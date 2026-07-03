import { services, siteUrl } from '../data/site.js';

const pages = [
  '/',
  '/about/',
  '/contact/',
  '/gallery/',
  '/services/',
  ...services.map((service) => `/services/${service.slug}/`)
];

export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
    .map(
      (page) =>
        `  <url><loc>${new URL(page, siteUrl).toString()}</loc><changefreq>weekly</changefreq><priority>${page === '/' ? '1.0' : '0.8'}</priority></url>`
    )
    .join('\n')}\n</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}
