/* eslint-disable no-console */
/**
 * postbuild: 把 dist/index.html 复制为 dist/404.html
 *
 * GitHub Pages 在用户访问未知路径时，会返回 404.html。
 * 我们的 SPA 用 BrowserRouter，必须保证 404.html 仍然是 index.html 的内容，
 * 这样前端路由才能接管并渲染对应页面。
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');

const src = path.join(distDir, 'index.html');
const dst = path.join(distDir, '404.html');

try {
  await fs.copyFile(src, dst);
  const stat = await fs.stat(dst);
  console.log(`postbuild: 404.html created (${(stat.size / 1024).toFixed(1)} KB)`);
} catch (err) {
  console.error('postbuild: failed to create 404.html:', err.message);
  process.exit(1);
}
