import type { IWechatService, ShareChannel, ShareOptions, ShareResult } from './IWechatService';
import { MockWechatService } from './MockWechat';
import { WechatJSSDKService } from './WechatJSSDK';

const mode = import.meta.env.VITE_WECHAT_MODE ?? 'mock';

function createService(): IWechatService {
  if (mode === 'real') {
    console.log('[WechatService] 使用真实微信JSSDK');
    return new WechatJSSDKService();
  }
  console.log('[WechatService] 使用Mock微信');
  return new MockWechatService();
}

export const wechatService: IWechatService = createService();

export type { IWechatService, ShareChannel, ShareOptions, ShareResult };
export { MockWechatService, WechatJSSDKService };
