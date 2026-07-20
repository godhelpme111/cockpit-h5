/**
 * 路线图组件（RouteMap）
 * ─────────────────────
 *  - 顶部：杭州·西湖文化线 + 站点列表（副标题）
 *  - 中部：6 个站点之间用一条主线串起来
 *  - 主线上：每个站点上方有一个"地标图标"（emoji）
 *  - 主线上：当前车辆位置有一辆"小巴车"图标，附带"抖动"动画表达"行驶中"
 *  - 站点下方：站名；当前站和下一站高亮
 *  - 车辆用 framer-motion spring 平滑移动
 */
import { useEffect, useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Bus } from 'lucide-react';
import { useRouteStore, getVehiclePosition, type Station } from '@/stores/routeStore';

const TICK_MS = 200; // 5 fps 推进 progress（视觉够用，省 CPU）

export default function RouteMap() {
  const stations = useRouteStore((s) => s.stations);
  const currentIndex = useRouteStore((s) => s.currentIndex);
  const progress = useRouteStore((s) => s.progress);
  const segmentDuration = useRouteStore((s) => s.segmentDuration);
  const arrivedCount = useRouteStore((s) => s.arrivedCount);
  const setProgress = useRouteStore((s) => s.setProgress);

  const lastTickRef = useRef<number>(performance.now());
  const rafRef = useRef<number | null>(null);
  const busControls = useAnimationControls();

  /* 主推进循环：根据真实时间推进 progress（避免 setInterval 漂移） */
  useEffect(() => {
    function step(now: number) {
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      const state = useRouteStore.getState();
      let { currentIndex, progress, segmentDuration } = state;
      progress += dt / segmentDuration;
      while (progress >= 1) {
        progress -= 1;
        currentIndex = (currentIndex + 1) % state.stations.length;
        // 跨站时，让 bus 抖一下
        busControls.start({
          y: [0, -3, 0],
          transition: { duration: 0.5, ease: 'easeOut' },
        });
        useRouteStore.setState({ arrivedCount: state.arrivedCount + 1 });
      }
      setProgress(progress);
      useRouteStore.setState({ currentIndex });
      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [setProgress, busControls]);

  /* bus 持续轻微抖动（行驶感） */
  useEffect(() => {
    busControls.start({
      y: [0, -1.5, 0, 1.5, 0],
      transition: { repeat: Infinity, duration: 0.7, ease: 'easeInOut' },
    });
  }, [busControls]);

  const total = stations.length;
  const vehicleX = getVehiclePosition(currentIndex, progress, total);

  /* 站点的水平 % */
  function stationX(i: number): number {
    return (i / (total - 1)) * 100;
  }

  return (
    <div className="bg-rice/95 rounded-card shadow-card p-4 sm:p-5 lg:p-6">
      {/* 标题区 */}
      <div className="mb-3 sm:mb-4">
        <h2 className="font-cn font-semibold text-ink
                       text-base sm:text-body lg:text-subtitle">
          杭州 · 西湖文化线
        </h2>
        <p className="text-ink/50 mt-0.5 font-cn
                      text-xs sm:text-small">
          {stations.map((s) => s.name).join(' · ')}
        </p>
      </div>

      {/* 路线区 */}
      <div className="relative pt-12 pb-3">
        {/* 站点 + 主线 + 车辆 整体布局：相对定位容器 */}
        <div className="relative h-20 sm:h-24 lg:h-28">
          {/* 主线（背景灰色） */}
          <div
            className="absolute top-1/2 left-0 right-0 h-1 bg-ink/15 rounded-full -translate-y-1/2"
            aria-hidden
          />
          {/* 主线（已走过的部分：青绿色） */}
          <div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-jade-light to-jade
                       rounded-full -translate-y-1/2 transition-[width] duration-300 ease-out"
            style={{ width: `${vehicleX}%` }}
            aria-hidden
          />

          {/* 站点（地标图标 + 圆点） */}
          {stations.map((s, i) => {
            const x = stationX(i);
            const isPast = i < currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <div
                key={s.id}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${x}%` }}
              >
                {/* 地标 emoji */}
                <div
                  className={`absolute -top-9 sm:-top-10 left-1/2 -translate-x-1/2
                              text-xl sm:text-2xl lg:text-3xl select-none
                              ${isCurrent ? 'scale-125' : 'opacity-90'}`}
                  style={{
                    filter: isCurrent
                      ? 'drop-shadow(0 2px 4px rgba(31,58,61,0.35))'
                      : 'drop-shadow(0 1px 2px rgba(31,58,61,0.15))',
                    transition: 'transform 0.4s',
                  }}
                >
                  {s.icon}
                </div>

                {/* 圆点 */}
                <div
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-rice
                              ${isPast || isCurrent ? 'bg-jade' : 'bg-ink/25'}
                              ${isCurrent ? 'ring-4 ring-jade/30' : ''}`}
                />
              </div>
            );
          })}

          {/* 车辆（bus） */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
            style={{ left: `${vehicleX}%` }}
            animate={busControls}
            initial={false}
            data-arrived={arrivedCount}
          >
            <div className="relative">
              <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10
                              rounded-full bg-gradient-to-br from-jade to-ink
                              flex items-center justify-center text-rice shadow-card
                              border-2 border-rice">
                <Bus size={14} className="sm:hidden" strokeWidth={2.5} />
                <Bus size={18} className="hidden sm:block lg:hidden" strokeWidth={2.5} />
                <Bus size={20} className="hidden lg:block" strokeWidth={2.5} />
              </div>
              {/* 行驶中光晕 */}
              <span className="absolute inset-0 rounded-full animate-ping
                               bg-jade/30 -z-10" />
            </div>
          </motion.div>
        </div>

        {/* 站名 */}
        <div className="relative h-5 mt-2">
          {stations.map((s, i) => {
            const x = stationX(i);
            const isCurrent = i === currentIndex;
            return (
              <div
                key={s.id}
                className={`absolute top-0 -translate-x-1/2 font-cn whitespace-nowrap
                            text-2xs sm:text-xs lg:text-small
                            ${isCurrent ? 'text-cinnabar font-semibold' : 'text-ink/60'}`}
                style={{ left: `${x}%` }}
              >
                {s.name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
