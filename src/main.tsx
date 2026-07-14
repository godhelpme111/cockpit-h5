import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * 注册 Service Worker（PWA 离线能力）
 * - 仅在生产环境注册（避免 dev 模式的 HMR 与 SW 缓存相互干扰）
 * - 路径与 scope 跟随 vite 的 base：Capacitor 部署时为 './'，GitHub Pages 时为 '/cockpit-h5/'
 * - 错误静默处理，不影响应用启动
 */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // BASE_URL 自带尾斜杠（如 './' 或 '/cockpit-h5/'），直接拼接即可
    const swBase = import.meta.env.BASE_URL;
    navigator.serviceWorker
      .register(`${swBase}sw.js`, { scope: swBase })
      .then((reg) => {
        // eslint-disable-next-line no-console
        console.info('[PWA] Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('[PWA] Service Worker registration failed:', err);
      });
  });
}
