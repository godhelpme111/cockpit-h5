import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ShareChannel, ShareOptions } from '@/services/wechat';
import { wechatService } from '@/services/wechat';

interface Props {
  open: boolean;
  channel: ShareChannel | null;
  options: ShareOptions;
  onClose: () => void;
  onResult?: (result: 'success' | 'cancel' | 'failed') => void;
}

const channelLabel: Record<ShareChannel, string> = {
  moments: '朋友圈',
  wechat: '微信好友',
  save: '保存到本地',
  qrcode: '扫码下载',
};

export default function ShareModal({ open, channel, options, onClose, onResult }: Props) {
  const [status, setStatus] = useState<'idle' | 'sharing' | 'success'>('idle');

  useEffect(() => {
    if (!open || !channel) {
      setStatus('idle');
      return;
    }
    setStatus('sharing');
    wechatService.share(channel, options).then((res) => {
      if (res === 'success') {
        setStatus('success');
        onResult?.('success');
        setTimeout(() => onClose(), 2000);
      } else {
        onResult?.(res);
        onClose();
      }
    });
  }, [open, channel, options, onResult, onClose]);

  if (!open || !channel) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-rice rounded-card shadow-card p-8 max-w-md w-full mx-4"
        >
          {status === 'sharing' && (
            <div className="text-center py-8">
              <div className="text-subtitle font-cn mb-4">分享到{channelLabel[channel]}</div>
              <div className="flex justify-center my-6">
                <div className="w-16 h-16 border-4 border-ink/20 border-t-cinnabar rounded-full animate-spin" />
              </div>
              <div className="text-small text-ink/60">正在生成分享卡片…</div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <CheckCircle2 size={64} className="text-jade" />
              </div>
              <div className="text-subtitle font-cn text-jade mb-2">分享成功</div>
              <div className="text-small text-ink/60">
                Vlog已发送到{channelLabel[channel]}～
              </div>
            </div>
          )}

          {/* 朋友圈模拟截图 */}
          {channel === 'moments' && status === 'sharing' && (
            <div className="mt-6 border border-ink/15 rounded-card p-4 bg-mountain/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cinnabar to-palace" />
                <div>
                  <div className="text-small font-medium">我</div>
                  <div className="text-xs text-ink/50">刚刚</div>
                </div>
              </div>
              <div className="text-small text-ink mb-2">{options.description}</div>
              <div className="aspect-video bg-ink/80 rounded flex items-center justify-center text-rice/50">
                ▶ {options.title} · 视频已生成
              </div>
              <div className="mt-2 text-xs text-ink/40">📍 示例景区</div>
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-ink/40 hover:text-ink"
          >
            <X size={24} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
