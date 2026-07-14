import type { IDigitalHuman } from './IDigitalHuman';
import type { DHState, DHConfig, SpeakOptions, DHEvent, DHHandler } from '@/types';

/**
 * 百度智能云 数字人 SDK 实现（占位）
 *
 * 真实集成时需：
 * 1. 在百度智能云控制台创建数字人形象，获取 avatarId
 * 2. 引入百度数字人SDK：@baidu/digital-human-sdk
 * 3. 实现 WebSocket 双向通信
 * 4. 处理 ASR 音频流
 * 5. 渲染数字人视频流
 */
export class BaiduDigitalHuman implements IDigitalHuman {
  private state: DHState = 'idle';
  private config: DHConfig | null = null;
  private ws: WebSocket | null = null;

  async init(config: DHConfig): Promise<void> {
    this.config = config;
    const appId = import.meta.env.VITE_BAIDU_APP_ID;
    const apiKey = import.meta.env.VITE_BAIDU_API_KEY;

    if (!appId || !apiKey) {
      throw new Error('百度数字人SDK凭证未配置');
    }

    // TODO: 真实实现
    // 1. 获取 access_token
    // 2. 建立 WebSocket 连接
    // 3. 发送 start_session 信令
    console.log('[BaiduDigitalHuman] 初始化（占位）', { appId, config });

    // 占位：模拟连接
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  setState(state: DHState): void {
    this.state = state;
  }

  getState(): DHState {
    return this.state;
  }

  async speak(text: string, options?: SpeakOptions): Promise<void> {
    // TODO: 通过 WebSocket 发送 text，接收 TTS 音频流
    console.log('[BaiduDigitalHuman] speak', text, options);
    await new Promise((resolve) => setTimeout(resolve, text.length * 80));
  }

  stopSpeaking(): void {
    console.log('[BaiduDigitalHuman] stopSpeaking');
  }

  async listen(): Promise<string> {
    // TODO: 启动录音，音频流通过 WebSocket 发送至 ASR
    console.log('[BaiduDigitalHuman] listen');
    return '';
  }

  async stopListening(): Promise<string> {
    console.log('[BaiduDigitalHuman] stopListening');
    return '';
  }

  on(event: DHEvent, handler: DHHandler): void {
    // TODO: 实现事件订阅
  }

  destroy(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
