import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api/v1/auth': { target: 'http://localhost:8001', changeOrigin: true },
      '/api/v1/events': { target: 'http://localhost:8002', changeOrigin: true },
      '/api/v1/organizer': { target: 'http://localhost:8002', changeOrigin: true },
      '/api/v1/orders': { target: 'http://localhost:8003', changeOrigin: true },
      '/api/v1/tickets': { target: 'http://localhost:8005', changeOrigin: true },
      '/api/v1/checkin': { target: 'http://localhost:8007', changeOrigin: true },
    },
  },
});
