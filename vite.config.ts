import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        // React, the router and Helmet in a file of their own. They change far
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
      '@': path.resolve(__dirname, 'src'),
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
