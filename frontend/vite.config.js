import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 7000,
    strictPort: true,
    host: true, // Needed for docker and specific external connections
  },
});
