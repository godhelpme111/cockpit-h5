import type { IWechatService, ShareChannel, ShareOptions, ShareResult } from './IWechatService';
import QRCode from 'qrcode';

/**
 * Mock 微信服务
 * 使用 Web Share API（如果支持） + 二维码替代
 */
export class MockWechatService implements IWechatService {
  isWechatBrowser(): boolean {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent.toLowerCase();
    return /micromessenger/.test(ua);
  }

  async share(channel: ShareChannel, options: ShareOptions): Promise<ShareResult> {
    console.log('[MockWechat] share', channel, options);

    // 尝试使用 Web Share API
    if (channel === 'wechat' && typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: options.title,
          text: options.description,
          url: options.link,
        });
        return 'success';
      } catch (err) {
        if ((err as Error).name === 'AbortError') return 'cancel';
        // 降级到模拟
      }
    }

    // 模拟分享
    await new Promise((r) => setTimeout(r, 800));
    return 'success';
  }

  async generateQRCode(content: string, size = 200): Promise<string> {
    try {
      return await QRCode.toDataURL(content, {
        width: size,
        margin: 2,
        color: {
          dark: '#1F3A3D',
          light: '#F5F1E8',
        },
      });
    } catch (err) {
      console.error('[MockWechat] QRCode生成失败', err);
      return '';
    }
  }
}
