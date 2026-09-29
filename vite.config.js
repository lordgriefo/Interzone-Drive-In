import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],

  build: {
    // Raise chunk warning threshold — video/audio assets can be large
    chunkSizeWarningLimit: 1000,
  },
});
