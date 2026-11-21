import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * The site's public origin, baked in at build time as `__SITE_URL__`
 * (`company.siteUrl`): canonical links, og:url, og:image and the breadcrumb
 * data all use it, and social crawlers fetch the share images from it.
 *
 * On Vercel it is the project's production domain, which Vercel sets for
 * every build: today hyltans-metall-phi.vercel.app, so share previews of the
 * preview really load their images; once hyltansmetall.se is added to the
 * project it becomes that (the shortest custom domain) on the next deploy,
 * with nothing to change here. `SITE_URL` overrides it; anywhere else
 * (local builds) it is the live domain.
 */
const siteUrl = (
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://hyltansmetall.se')
).replace(/\/$/, '');

export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    __SITE_URL__: JSON.stringify(siteUrl),
  },
  build: {
    rollupOptions: {
      output: {
        // React and the router in a file of their own. They change far
        // less often than the site's code, so after a content deploy returning
        // visitors keep them from cache (/assets is cached for a year) and only
        // fetch the small app chunk. No effect on the SSR build, which leaves
        // node_modules external.
        // CSS stays out of it: the @fontsource stylesheets would otherwise
        // become a second render-blocking CSS file instead of joining the
        // main one.
        manualChunks(id) {
          if (id.includes('node_modules') && !/\.(css|scss)$/.test(id)) return 'vendor';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  css: {
    modules: {
      generateScopedName: '[local]',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use '/src/styles/variables' as v;
          @use '/src/styles/mixins' as m;
        `,
      },
    },
  },
});
