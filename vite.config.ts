import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: '../resources/static'
  },
  define: {
    'process.env.BACKEND_PORT': process.env.BACKEND_PORT || 8080
  },
  root: './src/main/svelte',
})
