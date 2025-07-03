import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/generate_inkplus': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/generate_image': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  }
}); 