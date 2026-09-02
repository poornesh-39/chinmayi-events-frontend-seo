import { site } from '../data/site.js';

export function GET() {
  return new Response(
    JSON.stringify({
      name: 'Chinmayi Events',
      short_name: 'Chinmayi Events',
      description: site.description,
      start_url: '/',
      display: 'standalone',
      background_color: '#fffdf8',
      theme_color: '#6e1f2f',
      icons: [
        {
          src: '/images/opt/chinmayi-events-logo-icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/images/opt/chinmayi-events-logo-icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        }
      ]
    }),
    {
      headers: {
        'Content-Type': 'application/manifest+json; charset=utf-8'
      }
    }
  );
}
