import { useEffect, useRef } from 'react';

/**
 * 屏幕常亮Hook（用于车内录视频等场景）
 */
export function useWakeLock(enabled = true) {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return;

    const requestLock = async () => {
      try {
        sentinelRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (err) {
        console.warn('[useWakeLock] 请求失败', err);
      }
    };

    requestLock();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && enabled) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      sentinelRef.current?.release().catch(() => {});
      sentinelRef.current = null;
    };
  }, [enabled]);
}
