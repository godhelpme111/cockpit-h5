import { motion } from 'framer-motion';

interface Props {
  amplitude: number;       // 0~1
  active: boolean;
  className?: string;
}

/** 声波动画：显示在数字人周围或录音按钮上 */
export default function VoiceWave({ amplitude, active, className = '' }: Props) {
  const bars = 12;

  return (
    <div className={`flex items-center justify-center gap-1.5 h-16 ${className}`}>
      {Array.from({ length: bars }).map((_, i) => {
        // 错峰动画
        const offset = Math.sin((i / bars) * Math.PI) * amplitude;
        const baseHeight = active ? 12 + offset * 40 : 6;
        return (
          <motion.div
            key={i}
            className="w-1.5 bg-jade rounded-full"
            animate={{
              height: `${baseHeight}px`,
              opacity: active ? 0.5 + amplitude * 0.5 : 0.3,
            }}
            transition={{
              duration: 0.1,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}
