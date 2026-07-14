import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import type { VlogProject } from '@/types';
import { formatDuration } from '@/utils/format';

interface Props {
  project: VlogProject;
  url: string;
}

export default function VideoPlayer({ project, url }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  return (
    <div className="relative bg-ink rounded-card overflow-hidden shadow-card">
      <video
        ref={videoRef}
        src={url}
        className="w-full aspect-[9/16] max-h-[60vh] mx-auto object-contain bg-black"
        playsInline
      />

      {/* 中央播放按钮 */}
      {!playing && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-ink/30"
        >
          <div className="w-20 h-20 rounded-full bg-rice/90 flex items-center justify-center">
            <Play size={36} className="text-ink ml-1" fill="currentColor" />
          </div>
        </motion.button>
      )}

      {/* 底部控制条 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-ink/80 to-transparent text-rice">
        <div className="flex items-center gap-3">
          <button onClick={togglePlay} className="hover:scale-110 transition-transform">
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <div className="flex-1 h-1 bg-rice/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-rice"
              style={{ width: `${(currentTime / project.duration) * 100}%` }}
            />
          </div>
          <div className="text-small font-en tabular-nums">
            {formatDuration(currentTime)} / {formatDuration(project.duration)}
          </div>
        </div>
      </div>
    </div>
  );
}
