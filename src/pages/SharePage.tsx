import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Share2, Download, QrCode, Edit3, Check } from 'lucide-react';
import { useVlogStore } from '@/stores/vlogStore';
import { findTheme } from '@/data/themes';
import PageContainer from '@/components/layout/PageContainer';
import StatusBar from '@/components/layout/StatusBar';
import BackgroundLayer from '@/components/layout/BackgroundLayer';
import VideoPlayer from '@/components/vlog/VideoPlayer';
import ShareModal from '@/components/share/ShareModal';
import QRCodeView from '@/components/share/QRCodeView';
import type { ShareChannel } from '@/services/wechat';

const shareTemplates = [
  { id: 0, text: '【我在示例景区】今日份的小幸运，已被AI剪辑成Vlog ✨' },
  { id: 1, text: '一段车上的奇遇记，AI帮我记录了最美的风景～' },
  { id: 2, text: '扫码查看我的景区Vlog，让AI做你的专属摄影师' },
];

const channelMeta: { key: ShareChannel; label: string; icon: typeof Share2; color: string }[] = [
  { key: 'moments', label: '分享到朋友圈', icon: Share2, color: 'bg-jade' },
  { key: 'wechat', label: '发送给好友', icon: Share2, color: 'bg-cinnabar' },
  { key: 'save', label: '保存到本地', icon: Download, color: 'bg-palace' },
  { key: 'qrcode', label: '扫码下载', icon: QrCode, color: 'bg-ink' },
];

export default function SharePage() {
  const navigate = useNavigate();
  const { composedUrl, recordedClips, currentProject, selectedTheme, selectedBgm, selectedFilter } = useVlogStore();
  const theme = findTheme(selectedTheme);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [shareChannel, setShareChannel] = useState<ShareChannel | null>(null);

  const url = composedUrl || currentProject?.outputUrl;
  const title = theme ? `我的${theme.name}Vlog` : '我的景区Vlog';
  const description = shareTemplates[selectedTemplate].text;

  const handleChannel = (channel: ShareChannel) => {
    if (channel === 'save' && url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = `vlog-${Date.now()}.webm`;
      a.click();
      return;
    }
    setShareChannel(channel);
  };

  const shareLink = typeof window !== 'undefined' ? window.location.origin : 'https://example.com';

  return (
    <PageContainer className="ink-bg">
      <BackgroundLayer />
      <StatusBar showBack title="分享Vlog" />

      <div className="flex-1 flex flex-col lg:flex-row
                      pt-14 px-4 pb-4 gap-3
                      sm:pt-16 sm:px-6 sm:px-8
                      lg:pt-20 lg:px-12 lg:pb-8 lg:gap-8 min-h-0
                      overflow-y-auto lg:overflow-visible">
        {/* 左侧：视频预览 + 文案 */}
        <div className="w-1/2 flex flex-col gap-4">
          <div className="card flex items-center justify-center">
            {url ? (
              <VideoPlayer
                project={{
                  id: 'share',
                  themeId: selectedTheme,
                  bgmId: selectedBgm,
                  filter: selectedFilter,
                  clips: recordedClips,
                  createdAt: Date.now(),
                  duration: recordedClips.reduce((s, c) => s + c.duration, 0),
                  status: 'completed',
                  outputUrl: url,
                }}
                url={url}
              />
            ) : (
              <div className="text-ink/50 py-12 text-body">没有可分享的视频</div>
            )}
          </div>

          <div className="card">
            <div className="text-body text-ink/70 mb-3 font-cn flex items-center gap-2">
              <Edit3 size={18} />
              分享文案
            </div>
            <div className="space-y-2">
              {shareTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`w-full text-left p-3 rounded border transition-colors
                             ${selectedTemplate === tpl.id
                               ? 'border-cinnabar bg-cinnabar/5'
                               : 'border-ink/15 hover:border-ink/30'}`}
                >
                  <div className="flex items-start gap-2">
                    {selectedTemplate === tpl.id && (
                      <Check size={18} className="text-cinnabar flex-shrink-0 mt-0.5" />
                    )}
                    <span className="text-small text-ink">{tpl.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：分享渠道 + 二维码 */}
        <div className="w-1/2 flex flex-col gap-4">
          <div className="card flex-1">
            <div className="text-body text-ink/70 mb-4 font-cn">📤 选择分享方式</div>
            <div className="grid grid-cols-2 gap-4">
              {channelMeta.map((ch) => {
                const Icon = ch.icon;
                return (
                  <motion.button
                    key={ch.key}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleChannel(ch.key)}
                    className="p-6 rounded-card border-2 border-ink/10 hover:border-ink/30
                               bg-rice hover:shadow-card transition-all"
                  >
                    <div className={`w-14 h-14 ${ch.color} text-rice rounded-card
                                    flex items-center justify-center mb-3 mx-auto`}>
                      <Icon size={28} />
                    </div>
                    <div className="text-body text-ink font-cn">{ch.label}</div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="card flex flex-row items-center gap-6">
            <QRCodeView content={shareLink} size={140} />
            <div className="flex-1">
              <div className="text-body text-ink font-cn mb-2">📱 手机扫码查看</div>
              <div className="text-small text-ink/60 leading-relaxed">
                用手机扫描左侧二维码<br />
                可在手机端查看和保存Vlog<br />
                <span className="text-ink/40">（Demo：扫码显示本地预览）</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        open={shareChannel !== null}
        channel={shareChannel}
        options={{ title, description, link: shareLink, videoUrl: url }}
        onClose={() => setShareChannel(null)}
      />
    </PageContainer>
  );
}
