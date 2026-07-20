/**
 * 顶部"下一站"白色胶囊卡片
 * ─────────────────────────
 * 实时显示：下一站名 + 预计到达时间（mm:ss）
 * 每秒根据 routeStore 自动重算
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouteStore, getNextStation, getEtaSeconds } from '@/stores/routeStore';

function formatEta(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}分${s.toString().padStart(2, '0')}秒`;
}

export default function NextStopCard() {
  const currentIndex = useRouteStore((s) => s.currentIndex);
  const progress = useRouteStore((s) => s.progress);
  const segmentDuration = useRouteStore((s) => s.segmentDuration);

  // 强制每秒重渲染（progress 是 store 里的字段，本组件没订阅，单独维护 tick）
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const next = getNextStation(currentIndex);
  const eta = getEtaSeconds(progress, segmentDuration);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-2 bg-rice/95 rounded-full
                 px-4 py-1.5 sm:px-6 sm:py-2 lg:px-8 lg:py-2.5
                 shadow-card text-center whitespace-nowrap"
    >
      <span className="font-cn text-ink/60 text-xs sm:text-small">下一站</span>
      <span className="text-ink/30">·</span>
      <span className="font-cn font-semibold text-cinnabar text-sm sm:text-body lg:text-subtitle">
        {next.name}站
      </span>
      <span className="text-ink/30">/</span>
      <span className="font-en text-ink/80 text-xs sm:text-small">
        预计<strong className="text-cinnabar mx-0.5 tabular-nums">{formatEta(eta)}</strong>到达
      </span>
      {/* 隐藏消费 tick，触发每秒重渲染 */}
      <span className="hidden">{tick}</span>
    </motion.div>
  );
}
