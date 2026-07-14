import { motion, Reorder } from 'framer-motion';
import { GripVertical, Trash2 } from 'lucide-react';
import { formatDuration } from '@/utils/format';
import type { VideoClip } from '@/types';

interface Props {
  clips: VideoClip[];
  onReorder: (newOrder: VideoClip[]) => void;
  onRemove: (id: string) => void;
}

const directionColor: Record<VideoClip['direction'], string> = {
  front: 'bg-jade',
  left: 'bg-mountain',
  right: 'bg-palace',
  back: 'bg-ink',
};

const directionLabel: Record<VideoClip['direction'], string> = {
  front: '前',
  left: '左',
  right: '右',
  back: '后',
};

export default function Timeline({ clips, onReorder, onRemove }: Props) {
  const total = clips.reduce((s, c) => s + c.duration, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-small text-ink/70">
        <span>已录 {clips.length} 段 · 总时长 {formatDuration(total)}</span>
        {clips.length > 0 && (
          <span className="text-ink/50">长按拖动排序，点击右侧删除</span>
        )}
      </div>

      {clips.length === 0 ? (
        <div className="h-24 border-2 border-dashed border-ink/20 rounded-card
                        flex items-center justify-center text-ink/40">
          尚未录制任何片段
        </div>
      ) : (
        <Reorder.Group
          axis="x"
          values={clips}
          onReorder={onReorder}
          className="flex gap-3 overflow-x-auto pb-2"
        >
          {clips.map((clip, i) => (
            <Reorder.Item
              key={clip.id}
              value={clip}
              className="flex-shrink-0 w-40 cursor-grab active:cursor-grabbing"
            >
              <motion.div
                layout
                className="relative h-24 rounded-card overflow-hidden shadow-card
                           bg-gradient-to-br from-mountain to-ink/20"
              >
                <div className={`absolute top-1 left-1 w-5 h-5 ${directionColor[clip.direction]}
                                rounded-full flex items-center justify-center text-rice text-xs`}>
                  {directionLabel[clip.direction]}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-ink/80 to-transparent">
                  <div className="text-rice text-small truncate">{clip.title}</div>
                  <div className="text-rice/70 text-xs font-en">
                    #{i + 1} · {clip.duration}s
                  </div>
                </div>

                <button
                  onClick={() => onRemove(clip.id)}
                  className="absolute top-1 right-1 w-6 h-6 bg-cinnabar/80 text-rice rounded
                             flex items-center justify-center hover:bg-cinnabar"
                >
                  <Trash2 size={12} />
                </button>

                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-ink/40">
                  <GripVertical size={14} />
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  );
}
