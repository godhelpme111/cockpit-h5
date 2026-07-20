/**
 * 智能版 HomePage
 * ──────────────
 * 1:1 还原设计稿：
 *   顶部：Mogo智游 品牌 + 下一站白色胶囊 + Mogo Logo
 *   路线：RouteMap（6 站点 + 动画车辆）
 *   底部 3 张卡片：
 *     - 我的相册（导航到 /album）
 *     - 拍vlog（导航到 /vlog/shoot）
 *     - 数字人 + 3 个一键提问（点击后由数字人朗读答案）
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderOpen, Video, MessageCircleMore } from 'lucide-react';
import SmartHeader from '@/components/layout/SmartHeader';
import RouteMap from '@/components/route/RouteMap';
import DigitalHuman from '@/components/digital-human/DigitalHuman';
import PageContainer from '@/components/layout/PageContainer';
import BackgroundLayer from '@/components/layout/BackgroundLayer';
import { useDigitalHuman } from '@/hooks/useDigitalHuman';
import { useDigitalHumanStore } from '@/stores/digitalHumanStore';
import { useChatStore } from '@/stores/chatStore';
import { homeQuickQuestions } from '@/data/knowledgeBase';
import { digitalHumanService } from '@/services/digitalHuman';

export default function HomePage() {
  const navigate = useNavigate();
  const { speak, state } = useDigitalHuman();
  const { processQuestion } = useChatStore();

  // 首次进入问候
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (state === 'idle') {
        await speak('欢迎乘坐西湖文化线观光车，我是您的专属导游小雅～');
      }
    }, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDHState = (s: 'idle' | 'listening' | 'thinking' | 'speaking') => {
    useDigitalHumanStore.getState().setState(s);
  };

  const handleNav = (path: string) => {
    digitalHumanService.stopSpeaking();
    navigate(path);
  };

  const handleQuickAsk = async (q: string) => {
    setDHState('thinking');
    const answer = await processQuestion(q);
    if (answer) {
      setDHState('speaking');
      await speak(answer);
      setDHState('idle');
    }
  };

  return (
    <PageContainer className="ink-bg">
      <BackgroundLayer />

      <SmartHeader />

      <div className="flex-1 min-h-0 flex flex-col gap-3 sm:gap-4
                      px-4 pb-4 sm:px-6 sm:pb-5 lg:px-10 lg:pb-6
                      overflow-y-auto">
        {/* 路线图（占满首屏宽度） */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-shrink-0"
        >
          <RouteMap />
        </motion.div>

        {/* 3 张卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4
                     flex-1 min-h-0"
        >
          {/* Card 1: 我的相册 */}
          <motion.button
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleNav('/album')}
            className="card flex flex-col items-center justify-center gap-2 sm:gap-3
                       p-4 sm:p-5 lg:p-6 hover:shadow-card-hover transition-shadow"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16
                            rounded-card bg-gradient-to-br from-palace to-jade
                            flex items-center justify-center text-rice">
              <FolderOpen size={24} className="sm:hidden" />
              <FolderOpen size={28} className="hidden sm:block lg:hidden" />
              <FolderOpen size={32} className="hidden lg:block" />
            </div>
            <div className="text-center">
              <div className="font-cn font-semibold text-ink
                             text-base sm:text-body lg:text-subtitle">
                我的相册
              </div>
              <div className="text-ink/55 mt-0.5 font-cn
                             text-xs sm:text-small">
                回顾精彩旅程
              </div>
            </div>
          </motion.button>

          {/* Card 2: 拍vlog */}
          <motion.button
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleNav('/vlog/shoot')}
            className="card flex flex-col items-center justify-center gap-2 sm:gap-3
                       p-4 sm:p-5 lg:p-6 hover:shadow-card-hover transition-shadow"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16
                            rounded-card bg-gradient-to-br from-cinnabar to-palace
                            flex items-center justify-center text-rice">
              <Video size={24} className="sm:hidden" />
              <Video size={28} className="hidden sm:block lg:hidden" />
              <Video size={32} className="hidden lg:block" />
            </div>
            <div className="text-center">
              <div className="font-cn font-semibold text-ink
                             text-base sm:text-body lg:text-subtitle">
                拍vlog
              </div>
              <div className="text-ink/55 mt-0.5 font-cn
                             text-xs sm:text-small">
                沿途风景，AI 自动剪辑
              </div>
            </div>
          </motion.button>

          {/* Card 3: 数字人 + 一键提问 */}
          <div className="card flex flex-col p-3 sm:p-4 lg:p-5
                          bg-gradient-to-br from-mountain/40 to-rice">
            {/* 数字人 */}
            <div className="flex-1 min-h-0 flex items-end justify-center
                            relative overflow-hidden">
              <DigitalHuman size="sm" showWave amplitude={0} />
            </div>
            <div className="mt-1 sm:mt-2 text-center">
              <div className="inline-flex items-center gap-1 text-ink/70 font-cn
                             text-xs sm:text-small">
                <MessageCircleMore size={12} className="sm:hidden" />
                <MessageCircleMore size={14} className="hidden sm:block" />
                <span>点击想问的问题</span>
              </div>
            </div>
            {/* 3 个彩色提问 */}
            <div className="mt-1.5 sm:mt-2 flex flex-col gap-1.5 sm:gap-2">
              {homeQuickQuestions.map((q, i) => (
                <motion.button
                  key={q.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={state === 'speaking' || state === 'thinking'}
                  onClick={() => handleQuickAsk(q.text)}
                  className={`bg-gradient-to-r ${q.gradient} text-rice
                             font-cn rounded-full px-3 py-1.5 sm:px-4 sm:py-2
                             text-xs sm:text-small lg:text-body
                             shadow-soft hover:shadow-card
                             transition-all whitespace-nowrap
                             disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {q.text}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
}
