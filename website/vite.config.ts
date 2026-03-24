import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project URL: https://<owner>.github.io/<repo>/
// Set VITE_BASE=/RepoName/ in CI (see .github/workflows/deploy-pages.yml).
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@components': path.resolve(__dirname, '../src/app/components'),
    },
  },
})
