import { motion } from 'framer-motion';
import { Circle, Square, Pause, Play } from 'lucide-react';
import { formatDuration } from '@/utils/format';

interface Props {
  isRecording: boolean;
  isPaused?: boolean;
  duration: number;
  maxDuration?: number;
  onStart: () => void;
  onStop: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

export default function RecordControl({
  isRecording,
  isPaused,
  duration,
  maxDuration = 60,
  onStart,
  onStop,
  onPause,
  onResume,
}: Props) {
  const progress = Math.min(duration / maxDuration, 1);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 时长显示 */}
      <div className="flex items-center gap-4">
        <div className="text-4xl font-en text-cinn tabular-nums">
          {formatDuration(duration)}
        </div>
        <div className="text-small text-ink/50">/ {formatDuration(maxDuration)}</div>
      </div>

      {/* 进度条 */}
      <div className="w-64 h-1.5 bg-ink/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-cinnabar"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center gap-8">
        {!isRecording ? (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onStart}
            className="w-24 h-24 rounded-full bg-cinnabar text-rice
                       flex items-center justify-center shadow-card
                       hover:shadow-card-hover transition-shadow"
          >
            <Circle size={48} fill="currentColor" />
          </motion.button>
        ) : (
          <>
            {isPaused ? (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onResume}
                className="w-16 h-16 rounded-full bg-jade text-rice
                           flex items-center justify-center shadow-card"
              >
                <Play size={32} fill="currentColor" />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onPause}
                className="w-16 h-16 rounded-full bg-mountain text-ink
                           flex items-center justify-center shadow-card"
              >
                <Pause size={32} />
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onStop}
              className="w-24 h-24 rounded-full bg-cinnabar text-rice
                         flex items-center justify-center shadow-card
                         ring-4 ring-cinnabar/30 animate-pulse"
            >
              <Square size={36} fill="currentColor" />
            </motion.button>
          </>
        )}
      </div>

      <div className="text-small text-ink/60 font-cn">
        {!isRecording ? '点击开始录制' : isPaused ? '已暂停 · 点击继续或停止' : '录制中… · 点击暂停或停止'}
      </div>
    </div>
  );
}
