import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import VlogShootPage from './pages/VlogShootPage';
import VlogEditPage from './pages/VlogEditPage';
import SharePage from './pages/SharePage';
import AlbumPage from './pages/AlbumPage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/chat', element: <ChatPage /> },
  { path: '/vlog/shoot', element: <VlogShootPage /> },
  { path: '/vlog/edit', element: <VlogEditPage /> },
  { path: '/vlog/share', element: <SharePage /> },
  { path: '/album', element: <AlbumPage /> },
]);
