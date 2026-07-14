import type { IWechatService, ShareChannel, ShareOptions, ShareResult } from './IWechatService';
import QRCode from 'qrcode';

/**
 * 微信 JSSDK 真实实现（占位）
 *
 * 真实集成流程：
 * 1. 服务端生成 JS-SDK 签名（需配置 JS安全域名、IP白名单）
 * 2. 引入 https://res.wx.qq.com/open/js/jweixin-1.6.0.js
 * 3. wx.config({ appId, timestamp, nonceStr, signature, jsApiList })
 * 4. wx.ready() 后调用 wx.updateAppMessageShareData / updateTimelineShareData
 */
export class WechatJSSDKService implements IWechatService {
  isWechatBrowser(): boolean {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent.toLowerCase();
    return /micromessenger/.test(ua);
  }

  async share(channel: ShareChannel, options: ShareOptions): Promise<ShareResult> {
    // TODO: 调用 wx.updateAppMessageShareData / updateTimelineShareData
    console.log('[WechatJSSDK] share', channel, options);
    return 'success';
  }

  async generateQRCode(content: string, size = 200): Promise<string> {
    return await QRCode.toDataURL(content, { width: size });
  }
}
