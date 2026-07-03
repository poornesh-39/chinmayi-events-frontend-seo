import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  output: 'static',
  site: process.env.PUBLIC_SITE_URL || 'https://chinmayi-events.netlify.app',
  vite: {
    server: {
      proxy: {
        '/api': {
          target:
            process.env.PUBLIC_API_URL ||
            'https://chinmayi-events-backend.onrender.com',
          changeOrigin: true,
          secure: true
        }
      }
    },
    define: {
      'process.env': {}
    }
  }
});
