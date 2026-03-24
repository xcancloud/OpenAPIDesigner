import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const srcRoot = path.resolve(__dirname, '../src')
const componentsRoot = path.resolve(__dirname, '../src/app/components')

function isFileUnder(parent: string, file: string): boolean {
  const rel = path.relative(parent, file)
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel)
}

/**
 * Source under ../src resolves node_modules by walking up from that file, hitting
 * repo root (no deps on CI) before website/node_modules. When the importer is in
 * ../src and outside node_modules, resolve bare specifiers from website/node_modules.
 * Importers inside packages (e.g. shiki → shiki/wasm) are left to default resolution.
 */
function resolveParentSrcFromWebsiteNm(): Plugin {
  return {
    name: 'resolve-parent-src-from-website-node-modules',
    enforce: 'pre',
    resolveId(id, importer) {
      if (!importer) return null
      if (importer.includes(`${path.sep}node_modules${path.sep}`)) return null
      if (!isFileUnder(srcRoot, importer)) return null
      if (id.startsWith('.') || id.startsWith('\0') || path.isAbsolute(id)) return null

      try {
        return require.resolve(id, { paths: [__dirname] })
      } catch {
        return null
      }
    },
  }
}

// GitHub Pages project URL: https://<owner>.github.io/<repo>/
// Set VITE_BASE=/RepoName/ in CI (see .github/workflows/deploy-pages.yml).
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [resolveParentSrcFromWebsiteNm(), react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      { find: /^@\/(.*)$/, replacement: `${srcRoot}/$1` },
      { find: /^@components\/(.*)$/, replacement: `${componentsRoot}/$1` },
    ],
  },
})
