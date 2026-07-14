import { motion } from 'framer-motion';
import type { ClipDirection, ClipCategory } from '@/types';

interface Props {
  currentDirection: ClipDirection;
  onSelect?: (dir: ClipDirection) => void;
}

/** 4宫格摄像头预览 - 模拟车外前/左/右/后摄像头 */
export default function CameraGrid({ currentDirection, onSelect }: Props) {
  const directions: { dir: ClipDirection; label: string; icon: string }[] = [
    { dir: 'front', label: '前', icon: '⬆' },
    { dir: 'left', label: '左', icon: '⬅' },
    { dir: 'right', label: '右', icon: '➡' },
    { dir: 'back', label: '后', icon: '⬇' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {directions.map((d) => {
        const isActive = currentDirection === d.dir;
        return (
          <motion.button
            key={d.dir}
            onClick={() => onSelect?.(d.dir)}
            whileTap={{ scale: 0.97 }}
            className={`relative aspect-video rounded-card overflow-hidden border-2 transition-all
                       ${isActive ? 'border-cinnabar shadow-card-hover' : 'border-ink/20'}`}
          >
            {/* 模拟视频画面 */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getDirColor(d.dir)}`}>
              <DirectionScene direction={d.dir} />
            </div>

            {/* 方向标签 */}
            <div className="absolute top-2 left-2 px-2 py-1 bg-ink/70 text-rice text-small rounded">
              {d.icon} {d.label}车外
            </div>

            {/* 活跃指示 */}
            {isActive && (
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-cinnabar text-rice text-small rounded">
                <span className="w-2 h-2 bg-rice rounded-full animate-pulse" />
                REC
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

function getDirColor(dir: ClipDirection) {
  const map: Record<ClipDirection, string> = {
    front: 'from-jade/40 to-ink/30',
    left: 'from-mountain to-ink/30',
    right: 'from-palace/40 to-cinnabar/20',
    back: 'from-ink/40 to-jade/30',
  };
  return map[dir];
}

function DirectionScene({ direction }: { direction: ClipDirection }) {
  // 简化的SVG场景占位
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
      {/* 远山轮廓 */}
      <path
        d="M0,70 Q30,50 60,60 T120,55 T200,65 L200,100 L0,100 Z"
        fill="rgba(31,58,61,0.3)"
      />
      <path
        d="M0,80 Q40,65 80,75 T160,70 T200,75 L200,100 L0,100 Z"
        fill="rgba(31,58,61,0.5)"
      />
      {/* 太阳/月 */}
      {direction === 'front' && <circle cx="100" cy="30" r="12" fill="rgba(255,200,100,0.5)" />}
      {/* 装饰元素 */}
      <text x="100" y="50" textAnchor="middle" fontSize="10" fill="rgba(31,58,61,0.4)">
        {direction === 'front' && '◆ 前方山峦 ◆'}
        {direction === 'left' && '◆ 左侧风光 ◆'}
        {direction === 'right' && '◆ 右侧景致 ◆'}
        {direction === 'back' && '◆ 后方归途 ◆'}
      </text>
    </svg>
  );
}
