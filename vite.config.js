import { defineConfig } from 'vite';

export default defineConfig({
  base: '/spectrum/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2020',
  },
  server: {
    port: 3000,
  },
});
