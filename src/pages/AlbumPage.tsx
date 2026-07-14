import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, MessageCircle, Heart, Trash2, Play } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import StatusBar from '@/components/layout/StatusBar';
import BackgroundLayer from '@/components/layout/BackgroundLayer';
import { useVlogStore } from '@/stores/vlogStore';
import { useChatStore } from '@/stores/chatStore';
import { findTheme } from '@/data/themes';
import { formatDate, formatDuration } from '@/utils/format';

type Tab = 'vlog' | 'chat' | 'favorites';

export default function AlbumPage() {
  const { projects, reset } = useVlogStore();
  const { messages } = useChatStore();
  const [tab, setTab] = useState<Tab>('vlog');
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);

  return (
    <PageContainer className="ink-bg">
      <BackgroundLayer />
      <StatusBar showBack title="我的相册" />

      <div className="flex-1 flex flex-col
                      pt-14 px-4 pb-4
                      sm:pt-16 sm:px-6
                      lg:pt-20 lg:px-8 lg:pb-8 min-h-0
                      overflow-y-auto lg:overflow-visible">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'vlog' as Tab, label: '我的Vlog', icon: Video, count: projects.length },
            { key: 'chat' as Tab, label: '问答历史', icon: MessageCircle, count: messages.length },
            { key: 'favorites' as Tab, label: '收藏', icon: Heart, count: 0 },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-6 py-3 rounded-btn flex items-center gap-2 font-cn transition-colors
                           ${isActive ? 'bg-ink text-rice' : 'bg-mountain text-ink hover:bg-mountain/70'}`}
              >
                <Icon size={20} />
                <span>{t.label}</span>
                <span className={`text-small ${isActive ? 'text-rice/60' : 'text-ink/50'}`}>
                  ({t.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'vlog' && (
            projects.length === 0 ? (
              <EmptyState
                icon={<Video size={64} className="text-ink/30" />}
                title="还没有Vlog"
                description="点击首页的「拍Vlog」开始你的第一支专属Vlog吧～"
              />
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {projects.map((p) => {
                  const theme = findTheme(p.themeId);
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card overflow-hidden cursor-pointer hover:shadow-card-hover transition-all"
                      onClick={() => p.outputUrl && setPlayingUrl(p.outputUrl)}
                    >
                      <div
                        className="aspect-video rounded-card mb-3 flex items-center justify-center text-rice"
                        style={{
                          background: `linear-gradient(135deg, ${theme?.primaryColor}, ${theme?.secondaryColor})`,
                        }}
                      >
                        <Play size={48} className="opacity-80" />
                      </div>
                      <div className="text-body font-cn font-medium">{theme?.name || 'Vlog'}</div>
                      <div className="text-small text-ink/60 flex items-center justify-between mt-1">
                        <span>{formatDate(new Date(p.createdAt))}</span>
                        <span className="font-en">{formatDuration(p.duration)}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )
          )}

          {tab === 'chat' && (
            messages.length === 0 ? (
              <EmptyState
                icon={<MessageCircle size={64} className="text-ink/30" />}
                title="还没有对话记录"
                description="点击首页的「智能问答」与小雅聊天吧～"
              />
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className="card flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                   ${m.role === 'user' ? 'bg-ink text-rice' : 'bg-cinnabar text-rice'}`}>
                      {m.role === 'user' ? '我' : '雅'}
                    </div>
                    <div className="flex-1">
                      <div className="text-small text-ink/50">
                        {formatDate(new Date(m.timestamp))}
                        {m.role === 'assistant' && ' · 小雅'}
                      </div>
                      <div className="text-body text-ink mt-1">{m.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'favorites' && (
            <EmptyState
              icon={<Heart size={64} className="text-ink/30" />}
              title="还没有收藏"
              description="收藏喜欢的景点和Vlog，这里会显示出来"
            />
          )}
        </div>
      </div>

      {/* 视频播放弹窗 */}
      {playingUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90"
          onClick={() => setPlayingUrl(null)}
        >
          <video
            src={playingUrl}
            controls
            autoPlay
            className="max-h-[90vh] max-w-[90vw] rounded-card"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </PageContainer>
  );
}

function EmptyState({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-20">
      <div className="mb-4">{icon}</div>
      <div className="text-subtitle text-ink mb-2">{title}</div>
      <div className="text-body text-ink/50">{description}</div>
    </div>
  );
}
