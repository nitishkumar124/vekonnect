// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),  tailwindcss(),],
  server: {
    proxy: {
      '/api': { // Any request starting with /api will be proxied
        target: 'http://localhost:5000', // Your backend server address
        changeOrigin: true, // Changes the origin of the host header to the target URL
        secure: false, // For local development with http
        // rewrite: (path) => path.replace(/^\/api/, ''), // Optional: if your backend routes don't start with /api
      },
    },
    // Optional: Watch for file changes in both client and server (if running with concurrently)
    // watch: {
    //   usePolling: true,
    // },
  },
});