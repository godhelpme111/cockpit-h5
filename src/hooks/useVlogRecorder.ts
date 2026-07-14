import { useEffect, useRef, useState } from 'react';
import { useVlogStore } from '@/stores/vlogStore';
import { vlogClips, randomClips } from '@/data/vlogClips';
import { generateId } from '@/utils/format';
import type { VideoClip, ClipDirection } from '@/types';

/**
 * Vlog录制Hook（Mock实现）
 * - 模拟从车外摄像头按方向抽取视频片段
 * - 实际场景应使用MediaRecorder录制实时视频
 */
export function useVlogRecorder() {
  const {
    isRecording,
    recordDuration,
    recordedClips,
    startRecording: storeStart,
    stopRecording: storeStop,
    addClip,
  } = useVlogStore();

  const [currentDirection, setCurrentDirection] = useState<ClipDirection>('front');
  const intervalRef = useRef<number | null>(null);
  const lastClipTimeRef = useRef<number>(0);

  // 启动录制（Mock：每隔3-5秒添加一段视频）
  const start = () => {
    if (isRecording) return;
    storeStart();
    lastClipTimeRef.current = 0;

    intervalRef.current = window.setInterval(() => {
      // 随机切换方向
      const directions: ClipDirection[] = ['front', 'left', 'right', 'back'];
      const newDir = directions[Math.floor(Math.random() * directions.length)];
      setCurrentDirection(newDir);

      // 随机取一段该方向的素材
      const candidates = vlogClips.filter((c) => c.direction === newDir);
      const clip = candidates[Math.floor(Math.random() * candidates.length)];

      const newClip: VideoClip = {
        ...clip,
        id: generateId(),
      };

      addClip(newClip);
      lastClipTimeRef.current = Date.now();
    }, 4000); // 每4秒添加一段
  };

  // 停止录制
  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    storeStop();
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isRecording,
    recordDuration,
    recordedClips,
    currentDirection,
    start,
    stop,
  };
}
