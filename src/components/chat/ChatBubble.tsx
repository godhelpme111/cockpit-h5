import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import type { Message } from '@/types';
import { formatDuration } from '@/utils/format';

interface Props {
  message: Message;
  onSpeak?: (text: string) => void;
}

export default function ChatBubble({ message, onSpeak }: Props) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-6 py-4 ${
          isUser
            ? 'bg-ink text-rice rounded-tr-sm'
            : 'bg-mountain text-ink rounded-tl-sm border border-ink/10'
        }`}
      >
        <div className="text-body leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
        {message.duration && (
          <div className={`mt-2 text-small ${isUser ? 'text-rice/60' : 'text-ink/40'}`}>
            🎤 {formatDuration(message.duration)}
          </div>
        )}
        {!isUser && onSpeak && (
          <button
            onClick={() => onSpeak(message.content)}
            className="mt-3 flex items-center gap-1 text-small text-jade hover:text-jade/70 transition-colors"
          >
            <Volume2 size={16} />
            播放语音
          </button>
        )}
      </div>
    </motion.div>
  );
}
