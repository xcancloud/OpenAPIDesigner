import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import viteCompression from 'vite-plugin-compression';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5678,
    strictPort: true,
    open: false
  },
  define: {
    'process.env': { NODE_ENV: 'production' }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../core')
    }
  },
  plugins: [
    vue(),
    viteCompression({
      algorithm: 'gzip', // 压缩算法
      ext: '.gz', // 压缩文件的扩展名
      threshold: 2048, // 文件大小达到该值（单位：字节）才会被压缩
      deleteOriginFile: false, // 是否删除原始文件
      verbose: true // 是否在控制台输出压缩信息
    }),
    nodePolyfills()
  ],
  clearScreen: false,
  json: {
    namedExports: true,
    stringify: false
  },
  build: {
    outDir: 'coredist',
    target: 'modules',
    minify: false,
    manifest: false,
    assetsDir: 'assets',
    copyPublicDir: false,
    cssCodeSplit: false,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 500,
    reportCompressedSize: false,
    rollupOptions: {
      external: ['canvg']
    },
    lib: {
      name: 'core',
      entry: {
        index: './core/index.ts'
      },
      formats: ['es', 'umd']
    }
  }
});
