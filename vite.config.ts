import vue from '@vitejs/plugin-vue';
import {defineConfig} from 'vite';
import {resolve} from 'path';
import viteCompression from 'vite-plugin-compression';
import {nodePolyfills} from 'vite-plugin-node-polyfills';

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 5678,
        strictPort: true,
        open: false,
    },
    define: {
        'process.env': {NODE_ENV: 'production'}
    },
    plugins: [
        vue(),
        viteCompression({
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 2048,
            deleteOriginFile: false,
            verbose: true
        }),
        nodePolyfills()
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'core')
        }
    },

    clearScreen: false,
    json: {
        namedExports: true,
        stringify: false
    },
    build: {
        outDir: 'dist',
        target: 'modules',
        minify: false,
        manifest: false,
        assetsDir: 'assets',
        cssCodeSplit: false,
        assetsInlineLimit: 4096,
        chunkSizeWarningLimit: 500,
        reportCompressedSize: false,
        rollupOptions: {
            external: ['canvg']
        },
        lib: {
            name: 'apiDesign',
            entry: {
                index: 'index.ts'
            },
            formats: ['es', 'umd'],

        }
    }
});
