import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// /api is proxied to the Node backend so the browser never deals with CORS in dev
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: process.env.VITE_API_TARGET || 'http://localhost:4000', changeOrigin: true },
    },
  },
});
