import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// GitHub Pages 子路径构建：设置 GITHUB_PAGES=true 时使用绝对路径 /cockpit-h5/。
// 默认仍是相对路径 './'，让 Capacitor / file:// / 任意子路径部署都能正确加载资源。
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const base = isGitHubPages ? '/cockpit-h5/' : './';

export default defineConfig({
  plugins: [react()],
  base,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  build: {
    outDir: 'dist',
    // GitHub Pages 构建不带 sourcemap（节省流量 + 不暴露源码）
    sourcemap: !isGitHubPages,
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
  },
});
