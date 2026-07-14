import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface Props {
  recording: boolean;
  onStart: () => void;
  onStop: () => void;
  amplitude?: number;
  disabled?: boolean;
}

/** 按住说话按钮 - 圆形带脉动效果 */
export default function RecordButton({
  recording,
  onStart,
  onStop,
  amplitude = 0,
  disabled,
}: Props) {
  return (
    <div className="relative flex flex-col items-center gap-4 select-none">
      {/* 脉动光晕 */}
      {recording && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-cinnabar"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-cinnabar"
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.2, 0, 0.2],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}

      <motion.button
        disabled={disabled}
        onMouseDown={onStart}
        onMouseUp={onStop}
        onMouseLeave={recording ? onStop : undefined}
        onTouchStart={onStart}
        onTouchEnd={onStop}
        className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center
                    text-rice shadow-card transition-colors
                    ${recording ? 'bg-cinnabar' : 'bg-ink hover:bg-ink-light'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        whileTap={{ scale: 0.95 }}
      >
        {recording ? <MicOff size={48} /> : <Mic size={48} />}
      </motion.button>

      <div className="text-small text-ink/70 font-cn">
        {recording ? '松手结束 · 正在录音' : '按住说话'}
      </div>
    </div>
  );
}
