import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/tu-proximo-paso-jujuy-en-datos/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@data': path.resolve(__dirname, './data'),
    },
  },
  build: {
    chunkSizeWarningLimit: 6000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('data/empleo_oede.json')) {
            return 'data-oede';
          }
          if (id.includes('data/eil.json')) {
            return 'data-eil';
          }
          if (id.includes('data/pbg.json')) {
            return 'data-pbg';
          }
          if (id.includes('data/mip_empleo.json')) {
            return 'data-mip';
          }
        },
      },
    },
  },
});
