import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useVlogStore, createVlogProject } from '@/stores/vlogStore';
import { findTheme, findBgm } from '@/data/themes';
import { videoService } from '@/services/video';
import PageContainer from '@/components/layout/PageContainer';
import StatusBar from '@/components/layout/StatusBar';
import BackgroundLayer from '@/components/layout/BackgroundLayer';
import Timeline from '@/components/vlog/Timeline';
import ThemeSelector from '@/components/vlog/ThemeSelector';
import VideoPlayer from '@/components/vlog/VideoPlayer';
import ComposeProgress from '@/components/common/ComposeProgress';

export default function VlogEditPage() {
  const navigate = useNavigate();
  const {
    recordedClips,
    selectedTheme,
    selectedBgm,
    selectedFilter,
    setTheme,
    removeClip,
    isComposing,
    composeProgress,
    composeStage,
    composedUrl,
    setComposing,
    setComposeProgress,
    setComposed,
    saveProject,
    reset,
  } = useVlogStore();

  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const theme = findTheme(selectedTheme);
  const totalDuration = recordedClips.reduce((s, c) => s + c.duration, 0);

  const handleGenerate = async () => {
    if (!theme || recordedClips.length === 0) return;
    setComposing(true);
    setComposeProgress(0, '准备中...');
    setGeneratedUrl(null);

    const bgm = findBgm(selectedBgm);

    try {
      const result = await videoService.compose(recordedClips, {
        theme,
        bgm,
        watermark: '示例景区 · AI',
        width: 1080,
        height: 1920,
        fps: 24,
        onProgress: (p, stage) => setComposeProgress(p, stage),
      });

      setGeneratedUrl(result.url);
      setComposed(result.url);
      setComposeProgress(1, '完成');

      // 保存项目
      const project = createVlogProject({
        themeId: selectedTheme,
        bgmId: selectedBgm,
        filter: selectedFilter,
        clips: recordedClips,
        outputUrl: result.url,
        duration: result.duration,
      });
      saveProject(project);
    } catch (err) {
      console.error('[VlogEdit] 合成失败', err);
      setComposeProgress(0, '合成失败，请重试');
      setTimeout(() => setComposing(false), 2000);
    } finally {
      setTimeout(() => setComposing(false), 500);
    }
  };

  const handleNext = () => {
    if (generatedUrl) {
      navigate('/vlog/share');
    }
  };

  const handleReset = () => {
    reset();
    navigate('/vlog/shoot');
  };

  return (
    <PageContainer className="ink-bg">
      <BackgroundLayer />
      <StatusBar showBack title="编辑Vlog" />

      <div className="flex-1 flex flex-col lg:flex-row
                      pt-14 px-4 pb-4 gap-3
                      sm:pt-16 sm:px-6
                      lg:pt-20 lg:px-8 lg:pb-8 lg:gap-6 min-h-0
                      overflow-y-auto lg:overflow-visible">
        {/* 左侧：预览 */}
        <div className="w-2/5 flex flex-col">
          <div className="card flex-1 flex flex-col items-center justify-center">
            {generatedUrl ? (
              <VideoPlayer
                project={{
                  id: 'preview',
                  themeId: selectedTheme,
                  bgmId: selectedBgm,
                  filter: selectedFilter,
                  clips: recordedClips,
                  createdAt: Date.now(),
                  duration: totalDuration,
                  status: 'completed',
                  outputUrl: generatedUrl,
                }}
                url={generatedUrl}
              />
            ) : (
              <div className="text-center text-ink/50">
                <div className="text-display mb-3">🎬</div>
                <div className="text-body">点击右侧"生成Vlog"开始制作</div>
                <div className="text-small mt-2 text-ink/40">
                  {recordedClips.length} 段 · {totalDuration}秒
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：编辑选项 */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="card">
            <div className="text-body text-ink/70 mb-3 font-cn">🎨 主题模板</div>
            <ThemeSelector value={selectedTheme} onChange={setTheme} />
          </div>

          <div className="card flex-1">
            <Timeline
              clips={recordedClips}
              onReorder={() => {}}
              onRemove={removeClip}
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="btn-secondary px-6 py-4 flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              重新录制
            </button>

            {!generatedUrl ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={isComposing || recordedClips.length === 0}
                className="btn-primary flex-1 py-4 text-subtitle flex items-center justify-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isComposing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    生成中…
                  </>
                ) : (
                  <>✨ 生成Vlog</>
                )}
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="btn-primary flex-1 py-4 text-subtitle flex items-center justify-center gap-2"
              >
                下一步 · 分享
                <ChevronRight size={20} />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* 合成进度弹窗 */}
      {isComposing && <ComposeProgress progress={composeProgress} stage={composeStage} />}
    </PageContainer>
  );
}
