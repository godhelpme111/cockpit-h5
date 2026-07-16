import { useEffect, useRef } from 'react';
import { digitalHumanService } from '@/services/digitalHuman';
import { useDigitalHumanStore } from '@/stores/digitalHumanStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * 百度数字人 Iframe 渲染组件
 * ─────────────────────────
 * 负责把数字人 iframe 挂到 DOM，并把 ref 通知给 Service 层。
 * Service 层持有 BaiduDHWebSDK，组件只负责视觉。
 */
export default function BaiduDigitalHumanIframe({ size = 'lg', className = '' }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { state } = useDigitalHumanStore();
  const service = digitalHumanService as any;

  // 尺寸映射（和 SVG 组件保持一致）
  const sizes = {
    sm: 'w-24 h-32',
    md: 'w-40 h-52',
    lg: 'w-56 h-72',
    xl: 'w-72 h-96',
  };

  // 监听 SDK 状态事件
  useEffect(() => {
    const offAlert = service.on?.('disconnectAlert', () => {
      console.warn('[DH Iframe] 数字人即将超时');
    });
    const offTimeout = service.on?.('timeout', () => {
      console.warn('[DH Iframe] 数字人已超时退出');
    });
    return () => {
      offAlert?.();
      offTimeout?.();
    };
  }, [service]);

  // 把 iframe 元素注册到 service
  useEffect(() => {
    if (iframeRef.current && typeof service.bindIframe === 'function') {
      service.bindIframe(iframeRef.current);
    }
  }, [service]);

  const iframeUrl =
    typeof service.getIframeUrl === 'function' ? service.getIframeUrl() : 'about:blank';

  return (
    <div className={`relative ${sizes[size]} ${className} flex items-end justify-center`}>
      {/* 数字人 iframe */}
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        title="百度数字人"
        allow="autoplay; encrypted-media"
        className="absolute inset-0 w-full h-full rounded-card bg-transparent"
        style={{
          border: 'none',
          // 数字人背景透明，video 之外的部分透出上层 UI
          background: 'transparent',
        }}
        // 数字人加载慢，给个空容错
        onError={(e) => console.warn('[DH Iframe] 加载失败', e)}
      />

      {/* 加载占位 / 状态提示 */}
      <AnimatePresence>
        {state === 'listening' && (
          <motion.div
            key="listening"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2
                       px-2 py-0.5 bg-jade/90 text-rice text-xs rounded-full
                       whitespace-nowrap font-cn"
          >
            🎙 正在倾听…
          </motion.div>
        )}
        {state === 'thinking' && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2
                       px-2 py-0.5 bg-mountain/90 text-rice text-xs rounded-full
                       whitespace-nowrap font-cn flex items-center gap-1"
          >
            <Loader2 size={12} className="animate-spin" />
            思考中…
          </motion.div>
        )}
        {state === 'speaking' && (
          <motion.div
            key="speaking"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2
                       px-2 py-0.5 bg-cinnabar/90 text-rice text-xs rounded-full
                       whitespace-nowrap font-cn"
          >
            🗣 正在回复
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** 检测是否应该走真实数字人（real 模式） */
export function isBaiduDHEnabled(): boolean {
  return (
    (import.meta.env.VITE_BAIDU_SDK_MODE ?? 'mock') === 'real' &&
    Boolean(import.meta.env.VITE_BAIDU_DH_TOKEN) &&
    Boolean(import.meta.env.VITE_BAIDU_DH_FIGURE_ID)
  );
}
