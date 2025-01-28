import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  define: {
    'process.env': {},
    'global': 'globalThis',
  },
  plugins: [react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser polyfills
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
  resolve: {
    alias: {
      buffer: 'buffer', // Polyfill buffer
    },
  },
});