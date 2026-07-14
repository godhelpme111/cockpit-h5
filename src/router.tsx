import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import VlogShootPage from './pages/VlogShootPage';
import VlogEditPage from './pages/VlogEditPage';
import SharePage from './pages/SharePage';
import AlbumPage from './pages/AlbumPage';

// 当 vite.base = '/cockpit-h5/' 时（GitHub Pages 子路径部署），
//   import.meta.env.BASE_URL = '/cockpit-h5/'，需要作为 basename 告知 react-router。
// 当 vite.base = './' 时（本地开发 / Capacitor / 根目录 Pages 部署），
//   import.meta.env.BASE_URL = './'，不应作为 basename（react-router 要求 basename 以 '/' 开头）。
const rawBase = import.meta.env.BASE_URL;
const basename = rawBase.startsWith('/') ? rawBase.replace(/\/$/, '') : undefined;

export const router = createBrowserRouter(
  [
    { path: '/', element: <HomePage /> },
    { path: '/chat', element: <ChatPage /> },
    { path: '/vlog/shoot', element: <VlogShootPage /> },
    { path: '/vlog/edit', element: <VlogEditPage /> },
    { path: '/vlog/share', element: <SharePage /> },
    { path: '/album', element: <AlbumPage /> },
  ],
  basename ? { basename } : undefined
);
