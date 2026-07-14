import { useEffect, useState } from 'react';
import { formatTime, formatDate } from '@/utils/format';
import { useSettingsStore } from '@/stores/settingsStore';
import { Volume2, SunMedium, Settings, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  showBack?: boolean;
  title?: string;
}

export default function StatusBar({ showBack, title }: Props) {
  const navigate = useNavigate();
  const { volume, setVolume, brightness, setBrightness } = useSettingsStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 h-20 z-30 px-8 flex items-center justify-between
                    bg-gradient-to-b from-ink/80 to-transparent text-rice pointer-events-none">
      <div className="flex items-center gap-4 pointer-events-auto min-w-0 flex-shrink">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-rice/90 hover:text-rice transition-colors flex-shrink-0
                       text-small sm:text-body"
          >
            <ChevronLeft size={20} className="sm:hidden" />
            <ChevronLeft size={24} className="hidden sm:block" />
            <span>返回</span>
          </button>
        )}
        {title && <h1 className="font-cn whitespace-nowrap
                                text-base sm:text-lg lg:text-title">
          {title}
        </h1>}
        {!title && (
          <div className="flex items-center gap-3 text-body whitespace-nowrap overflow-hidden">
            <span className="font-en">{formatTime(now)}</span>
            <span className="text-rice/50">·</span>
            <span>示例景区环线</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-5 pointer-events-auto flex-shrink-0">
        <div className="flex items-center gap-2 group">
          <Volume2 size={22} />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 accent-rice opacity-70 group-hover:opacity-100 transition-opacity"
          />
        </div>
        <div className="flex items-center gap-2 group">
          <SunMedium size={22} />
          <input
            type="range"
            min={0.3}
            max={1}
            step={0.05}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-20 accent-rice opacity-70 group-hover:opacity-100 transition-opacity"
          />
        </div>
        <button
          onClick={() => alert('设置功能开发中')}
          className="hover:text-rice/80 transition-colors"
        >
          <Settings size={22} />
        </button>
      </div>
    </div>
  );
}
