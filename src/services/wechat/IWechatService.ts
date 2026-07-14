export type ShareChannel = 'moments' | 'wechat' | 'save' | 'qrcode';
export type ShareResult = 'success' | 'cancel' | 'failed';

export interface ShareOptions {
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface IWechatService {
  /** 检查是否在微信内 */
  isWechatBrowser(): boolean;
  /** 分享 */
  share(channel: ShareChannel, options: ShareOptions): Promise<ShareResult>;
  /** 生成二维码 */
  generateQRCode(content: string, size?: number): Promise<string>;
}
