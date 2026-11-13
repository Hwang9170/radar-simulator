import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The landing page builds into ../docs (served by GitHub Pages and Vercel).
// docs/sim/ holds the simulator and must survive builds, so the output folder
// is not emptied; scripts/clean.mjs removes only the landing's own files.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../docs',
    emptyOutDir: false,
    assetsDir: 'assets',
  },
});
