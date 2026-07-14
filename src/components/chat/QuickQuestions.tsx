import { motion } from 'framer-motion';
import { quickQuestions } from '@/data/knowledgeBase';

interface Props {
  onSelect: (question: string) => void;
}

export default function QuickQuestions({ onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <span className="text-small text-ink/60 self-center mr-2">💡 试试问我：</span>
      {quickQuestions.map((q, i) => (
        <motion.button
          key={q}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(q)}
          className="px-4 py-2 bg-mountain/60 border border-ink/15
                     text-ink text-small rounded-full
                     hover:bg-mountain hover:border-ink/30
                     transition-all duration-200"
        >
          {q}
        </motion.button>
      ))}
    </div>
  );
}
