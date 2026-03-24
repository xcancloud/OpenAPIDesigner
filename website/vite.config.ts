import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const srcRoot = path.resolve(__dirname, '../src')
const componentsRoot = path.resolve(__dirname, '../src/app/components')
/** Anchor inside website so bare imports resolve via website/node_modules + package "exports" (ESM). */
const websiteResolveAnchor = path.join(__dirname, 'src/main.tsx')

function isFileUnder(parent: string, file: string): boolean {
  const rel = path.relative(parent, file)
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel)
}

/**
 * Files under ../src would otherwise resolve node_modules from repo root (empty on CI).
 * Re-resolve bare specifiers using an importer under website/ so Vite/Rollup picks ESM via "exports".
 * (require.resolve forced CJS mains for react, lucide-react, etc.)
 */
function resolveParentSrcFromWebsiteNm(): Plugin {
  return {
    name: 'resolve-parent-src-from-website-node-modules',
    enforce: 'pre',
    async resolveId(id, importer, options) {
      if (!importer) return null
      if (importer.includes(`${path.sep}node_modules${path.sep}`)) return null
      if (!isFileUnder(srcRoot, importer)) return null
      if (id.startsWith('.') || id.startsWith('\0') || path.isAbsolute(id)) return null

      const resolved = await this.resolve(id, websiteResolveAnchor, {
        skipSelf: true,
        ...options,
      })
      return resolved?.id ?? null
    },
  }
}

// GitHub Pages project URL: https://<owner>.github.io/<repo>/
// Set VITE_BASE=/RepoName/ in CI (see .github/workflows/deploy-pages.yml).
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [resolveParentSrcFromWebsiteNm(), react(), tailwindcss()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'lucide-react'],
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      { find: /^@\/(.*)$/, replacement: `${srcRoot}/$1` },
      { find: /^@components\/(.*)$/, replacement: `${componentsRoot}/$1` },
    ],
  },
})
