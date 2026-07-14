import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Video, FolderOpen, Sparkles } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import StatusBar from '@/components/layout/StatusBar';
import BackgroundLayer from '@/components/layout/BackgroundLayer';
import DigitalHuman from '@/components/digital-human/DigitalHuman';
import { useDigitalHuman } from '@/hooks/useDigitalHuman';
import { useChatStore } from '@/stores/chatStore';
import { digitalHumanService } from '@/services/digitalHuman';

const features = [
  {
    key: 'chat',
    title: '智能问答',
    desc: '与小雅对话，问景区典故',
    icon: MessageCircle,
    color: 'from-jade to-ink',
    path: '/chat',
  },
  {
    key: 'vlog',
    title: '拍Vlog',
    desc: '沿途风景，AI自动剪辑',
    icon: Video,
    color: 'from-cinnabar to-palace',
    path: '/vlog/shoot',
  },
  {
    key: 'album',
    title: '我的相册',
    desc: '回顾精彩旅程',
    icon: FolderOpen,
    color: 'from-palace to-jade',
    path: '/album',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { speak, state } = useDigitalHuman();
  const { messages } = useChatStore();

  // 首次进入时主动问候
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (state === 'idle' && messages.length === 1) {
        await speak('欢迎乘坐示例景区环线观光车，我是您的专属导游小雅～请问您想去哪里看看呢？');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleFeatureClick = (path: string) => {
    digitalHumanService.stopSpeaking();
    navigate(path);
  };

  return (
    <PageContainer className="ink-bg">
      <BackgroundLayer />
      <StatusBar />

      {/* 主内容：响应式布局 */}
      <div className="flex-1 flex flex-col min-h-0
                      pt-14 px-4 pb-3 gap-2
                      sm:pt-16 sm:px-6 sm:pb-4 sm:gap-3
                      lg:pt-20 lg:px-12 lg:pb-6 lg:gap-4
                      overflow-y-auto lg:overflow-visible">
        {/* 数字人 + 标题区 - 占据剩余空间 */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 gap-1 sm:gap-2 lg:gap-3">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative flex-shrink-0"
          >
            <div className="block lg:hidden">
              <DigitalHuman size="sm" showWave amplitude={0} />
            </div>
            <div className="hidden lg:block">
              <DigitalHuman size="md" showWave amplitude={0} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2 text-palace text-xs sm:text-small mb-0.5 sm:mb-1">
              <Sparkles size={12} className="sm:hidden" />
              <Sparkles size={14} className="hidden sm:block" />
              <span>AI数字导游</span>
              <Sparkles size={12} className="sm:hidden" />
              <Sparkles size={14} className="hidden sm:block" />
            </div>
            <h1 className="font-cn text-glow leading-none
                           text-3xl sm:text-title lg:text-display">
              小雅
            </h1>
            <p className="text-ink/70 mt-0.5 sm:mt-1
                          text-xs sm:text-body">
              愿与您共赏这一程山水
            </p>
          </motion.div>
        </div>

        {/* 功能卡片区 - 固定在底部 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-5 w-full max-w-5xl mx-auto flex-shrink-0"
        >
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.button
                key={feat.key}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFeatureClick(feat.path)}
                className="card hover:shadow-card-hover transition-all duration-300
                           text-left group py-2 sm:py-3 lg:py-4 px-2 sm:px-4"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12
                                  rounded-card bg-gradient-to-br ${feat.color}
                                  flex items-center justify-center text-rice flex-shrink-0
                                  group-hover:scale-110 transition-transform`}>
                    <Icon size={16} className="sm:hidden" />
                    <Icon size={20} className="hidden sm:block lg:hidden" />
                    <Icon size={24} className="hidden lg:block" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-cn font-medium whitespace-nowrap
                                   text-sm sm:text-base lg:text-subtitle">
                      {feat.title}
                    </div>
                    <div className="text-ink/60 mt-0.5 truncate
                                   text-xs sm:text-small">
                      {feat.desc}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* 底部提示 */}
        <div className="text-ink/40 font-cn text-center flex-shrink-0
                       text-xs sm:text-small">
          提示：点击数字人或卡片开始体验
        </div>
      </div>
    </PageContainer>
  );
}
