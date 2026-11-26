import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'es2020',
      minify: 'esbuild' as const,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        input: { storefront: path.resolve('index.html'), googleLogin: path.resolve('google-login.html') },
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('/firebase/') || id.includes('/@firebase/')) {
              return 'vendor-firebase';
            }
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/scheduler/') ||
              id.includes('/react-router') ||
              id.includes('/@remix-run/') ||
              id.includes('/react-helmet-async/')
            ) {
              return 'vendor-react';
            }
            if (id.includes('/recharts/') || id.includes('/d3-') || id.includes('/victory-vendor/')) {
              return 'vendor-charts';
            }
            if (id.includes('/motion/') || id.includes('/framer-motion/')) {
              return 'vendor-motion';
            }
            if (id.includes('/lucide-react/')) {
              return 'vendor-icons';
            }
            if (id.includes('/@google/genai/')) {
              return 'vendor-genai';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
