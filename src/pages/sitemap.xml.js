import { services, siteUrl } from '../data/site.js';
import { getGalleryItems, galleryImageUrls } from '../data/live-content.js';

/**
 * `changefreq` and `priority` are deliberately absent — Google ignores both.
 *
 * `lastmod` is only emitted where there is a real signal for it (the newest
 * admin upload). Stamping every page with the build time on each deploy is the
 * fastest way to get Google to stop trusting lastmod for the whole site.
 */
const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const newestDate = (items) => {
  const times = items
    .map((item) => new Date(item.createdAt || item.uploadedAt || 0).getTime())
    .filter((time) => Number.isFinite(time) && time > 0);

  if (times.length === 0) return null;
  return new Date(Math.max(...times)).toISOString().slice(0, 10);
};

export async function GET() {
  const galleryItems = await getGalleryItems();
  const galleryUpdated = newestDate(galleryItems);
  const images = galleryImageUrls(galleryItems, 60);

  const pages = [
    { path: '/', lastmod: galleryUpdated, images: images.slice(0, 20) },
    { path: '/about/' },
    { path: '/contact/' },
    { path: '/gallery/', lastmod: galleryUpdated, images },
    { path: '/services/' },
    ...services.map((service) => ({ path: `/services/${service.slug}/` }))
  ];

  const entry = ({ path, lastmod, images: pageImages = [] }) => {
    const parts = [`    <loc>${escapeXml(new URL(path, siteUrl).toString())}</loc>`];
    if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`);

    for (const image of pageImages) {
      parts.push(
        '    <image:image>',
        `      <image:loc>${escapeXml(image.url)}</image:loc>`,
        `      <image:title>${escapeXml(image.title)}</image:title>`,
        '    </image:image>'
      );
    }

    return `  <url>\n${parts.join('\n')}\n  </url>`;
  };

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages.map(entry).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}
