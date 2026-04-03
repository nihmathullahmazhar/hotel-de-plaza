import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Dev server — serve index.html for all paths (SPA routing)
    historyApiFallback: true,
  },
  preview: {
    // Same for vite preview
    historyApiFallback: true,
  },
});

// ── Deployment note ─────────────────────────────────────────
// For production hosting (Netlify / Vercel / cPanel):
//
// Netlify: add a file public/_redirects with:
//   /*  /index.html  200
//
// Vercel: add to vercel.json:
//   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
//
// Apache (.htaccess in public/):
//   RewriteEngine On
//   RewriteBase /
//   RewriteRule ^index\.html$ - [L]
//   RewriteCond %{REQUEST_FILENAME} !-f
//   RewriteCond %{REQUEST_FILENAME} !-d
//   RewriteRule . /index.html [L]