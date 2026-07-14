import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface Props {
  progress: number;     // 0~1
  stage: string;
}

export default function ComposeProgress({ progress, stage }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm"
    >
      <div className="bg-rice rounded-card shadow-card p-10 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <Loader2 size={56} className="text-cinnabar mx-auto animate-spin" />
        </div>
        <div className="text-subtitle font-cn text-center mb-2">正在生成您的景区Vlog</div>
        <div className="text-small text-ink/60 text-center mb-6">{stage}</div>

        <div className="h-2 bg-mountain rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-jade to-cinnabar"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-center mt-2 text-small text-ink/50 font-en">
          {Math.round(progress * 100)}%
        </div>
      </div>
    </motion.div>
  );
}
