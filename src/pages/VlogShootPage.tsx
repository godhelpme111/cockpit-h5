import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVlogStore } from '@/stores/vlogStore';
import { useVlogRecorder } from '@/hooks/useVlogRecorder';
import { useWakeLock } from '@/hooks/useWakeLock';
import PageContainer from '@/components/layout/PageContainer';
import StatusBar from '@/components/layout/StatusBar';
import BackgroundLayer from '@/components/layout/BackgroundLayer';
import CameraGrid from '@/components/vlog/CameraGrid';
import RecordControl from '@/components/vlog/RecordControl';
import Timeline from '@/components/vlog/Timeline';
import ThemeSelector from '@/components/vlog/ThemeSelector';
import type { ClipDirection } from '@/types';
import { ChevronRight } from 'lucide-react';

export default function VlogShootPage() {
  const navigate = useNavigate();
  const {
    recordedClips,
    recordDuration,
    selectedTheme,
    setTheme,
    removeClip,
  } = useVlogStore();
  const { isRecording, currentDirection, start, stop } = useVlogRecorder();
  const [isPaused, setIsPaused] = useState(false);

  useWakeLock(isRecording);

  const canProceed = recordedClips.length >= 2;

  return (
    <PageContainer className="ink-bg">
      <BackgroundLayer />
      <StatusBar showBack title="拍Vlog" />

      <div className="flex-1 flex flex-col lg:flex-row
                      pt-14 px-4 pb-4 gap-3
                      sm:pt-16 sm:px-6
                      lg:pt-20 lg:px-8 lg:pb-8 lg:gap-6 min-h-0
                      overflow-y-auto lg:overflow-visible">
        {/* 左侧：摄像头预览 + 录制控制 */}
        <div className="flex flex-col gap-3 lg:w-2/5 lg:gap-4">
          <div className="card flex-1 flex flex-col">
            <div className="text-small lg:text-body text-ink/70 mb-2 lg:mb-3 font-cn">📹 车外摄像头</div>
            <CameraGrid
              currentDirection={currentDirection as ClipDirection}
              onSelect={() => {}}
            />
          </div>

          <div className="card">
            <RecordControl
              isRecording={isRecording}
              isPaused={isPaused}
              duration={recordDuration}
              maxDuration={60}
              onStart={() => { setIsPaused(false); start(); }}
              onStop={stop}
              onPause={() => setIsPaused(true)}
              onResume={() => setIsPaused(false)}
            />
          </div>
        </div>

        {/* 右侧：主题 + 时间线 + 下一步 */}
        <div className="flex-1 flex flex-col gap-3 lg:gap-4 min-h-0">
          <div className="card">
            <div className="text-small lg:text-body text-ink/70 mb-2 lg:mb-3 font-cn">🎨 主题模板</div>
            <ThemeSelector value={selectedTheme} onChange={setTheme} />
          </div>

          <div className="card flex-1 hidden lg:block">
            <Timeline
              clips={recordedClips}
              onReorder={() => {}}
              onRemove={removeClip}
            />
          </div>

          {/* 下一步按钮 */}
          <motion.button
            whileHover={canProceed ? { scale: 1.02 } : {}}
            whileTap={canProceed ? { scale: 0.98 } : {}}
            disabled={!canProceed}
            onClick={() => navigate('/vlog/edit')}
            className={`btn-primary w-full py-3 lg:py-5 text-subtitle lg:text-title flex items-center justify-center gap-3
                       ${canProceed ? '' : 'opacity-40 cursor-not-allowed'}`}
          >
            下一步 · 编辑Vlog
            <ChevronRight size={20} className="lg:hidden" />
            <ChevronRight size={28} className="hidden lg:block" />
          </motion.button>

          {recordedClips.length < 2 && (
            <div className="text-small text-ink/50 text-center -mt-1 lg:-mt-2">
              至少录制 2 段视频才能继续
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
