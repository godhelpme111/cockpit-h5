import { motion } from 'framer-motion';
import { MapPin, Image as ImageIcon, Play, ChevronRight } from 'lucide-react';
import type { RelatedCard } from '@/types';

interface Props {
  card: RelatedCard;
  onAction?: () => void;
}

export default function RelatedCardPanel({ card, onAction }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-rice/95 backdrop-blur-sm rounded-card shadow-card overflow-hidden cursor-pointer
                 hover:shadow-card-hover transition-shadow"
      onClick={card.action?.handler || onAction}
    >
      {/* 缩略图 */}
      {card.type !== 'action' && (
        <div className="h-32 bg-gradient-to-br from-jade/30 to-ink/30 flex items-center justify-center">
          {card.type === 'image' && <ImageIcon size={40} className="text-ink/40" />}
          {card.type === 'video' && <Play size={40} className="text-ink/40" />}
          {card.type === 'location' && <MapPin size={40} className="text-ink/40" />}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="text-body font-medium text-ink">{card.title}</div>
            {card.description && (
              <div className="text-small text-ink/60 mt-1">{card.description}</div>
            )}
          </div>
          {card.action && <ChevronRight size={20} className="text-ink/40" />}
        </div>
      </div>
    </motion.div>
  );
}
