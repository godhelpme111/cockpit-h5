/**
 * 智能版头
 * ───────
 *  - 左：Mogo智游 品牌名（黄/金色大字）+ AI出行智能导游（小字）
 *  - 中：NextStopCard（下一站白色胶囊）
 *  - 右：Mogo Logo
 *
 * 三栏在 lg 屏水平排列；sm 及以下纵向堆叠
 */
import { Sparkles } from 'lucide-react';
import NextStopCard from '@/components/route/NextStopCard';
import MogoLogo from '@/components/common/MogoLogo';

export default function SmartHeader() {
  return (
    <header className="relative z-20 w-full flex items-center justify-between gap-3
                       pt-3 pb-2 px-4 sm:pt-4 sm:px-6 lg:pt-5 lg:px-10">
      {/* 左：品牌 */}
      <div className="flex flex-col leading-tight min-w-0 flex-shrink-0">
        <h1 className="font-cn font-bold
                       text-2xl sm:text-title lg:text-display
                       bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500
                       bg-clip-text text-transparent
                       drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
          Mogo智游
        </h1>
        <div className="flex items-center gap-1 mt-0.5 lg:mt-1">
          <Sparkles size={10} className="text-rice/70 sm:hidden" />
          <Sparkles size={12} className="text-rice/70 hidden sm:block" />
          <span className="font-cn text-rice/85
                         text-2xs sm:text-xs lg:text-small">
            AI出行智能导游
          </span>
        </div>
      </div>

      {/* 中：下一站胶囊 */}
      <div className="flex-1 flex justify-center min-w-0">
        <NextStopCard />
      </div>

      {/* 右：Mogo Logo */}
      <div className="flex-shrink-0">
        <MogoLogo size="md" />
      </div>
    </header>
  );
}
