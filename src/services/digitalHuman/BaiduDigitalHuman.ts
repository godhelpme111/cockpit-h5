import type { IDigitalHuman } from './IDigitalHuman';
import type { DHState, DHConfig, SpeakOptions, DHEvent, DHHandler } from '@/types';
import { BaiduDHWebSDK, type BaiduDHConfig } from './BaiduDHWebSDK';

/**
 * 百度智能云数字人 SDK 实现（Web 端 iframe 方式）
 * ─────────────────────────────────────────────
 * 集成步骤：
 *   1. 百度智能云控制台开通"数字人"组件
 *   2. 在"形象信息列表"里选一个形象，拿到 figureId
 *   3. 调"接口通用说明"里的鉴权接口，生成 token
 *   4. 把 figureId / token / ttsPer 填到 .env.production
 *   5. VITE_BAIDU_SDK_MODE=real  即用真实数字人；mock 则用 SVG 假形象
 *
 * 通信机制：
 *   - 父页通过 postMessage 发送 { type: 'message' | 'command', content }
 *   - iframe 通过 postMessage 回传 { type: 'rtcState' | 'wsState' | 'msg', content }
 */

let uuidCounter = 0;
const uuid = (): string =>
  `req-${Date.now().toString(36)}-${(uuidCounter++).toString(36)}`;

export class BaiduDigitalHuman implements IDigitalHuman {
  private state: DHState = 'idle';
  private config: DHConfig | null = null;
  private sdk: BaiduDHWebSDK | null = null;
  private listeners: Map<DHEvent, DHHandler[]> = new Map();
  private currentCommandId: string | null = null;
  private speakingResolver: ((text: string) => void) | null = null;

  async init(config: DHConfig): Promise<void> {
    this.config = config;

    // 1) 解析 figureId / token / ttsPer
    //    真实模式（VITE_BAIDU_SDK_MODE=real）下，env 里的真实参数优先于 config；
    //    只有 mock 模式才用 config 里的 avatarId/voiceId（古风 IP "小雅"）。
    const isRealMode = (import.meta.env.VITE_BAIDU_SDK_MODE ?? 'mock') === 'real';
    const figureId =
      (isRealMode
        ? import.meta.env.VITE_BAIDU_DH_FIGURE_ID
        : null) ||
      config.figureId ||
      config.avatarId ||
      import.meta.env.VITE_BAIDU_DH_FIGURE_ID ||
      '';
    const ttsPer =
      (isRealMode
        ? import.meta.env.VITE_BAIDU_DH_TTS_PER
        : null) ||
      config.ttsPer ||
      config.voiceId ||
      import.meta.env.VITE_BAIDU_DH_TTS_PER ||
      '4105';
    const token =
      (isRealMode
        ? import.meta.env.VITE_BAIDU_DH_TOKEN
        : null) ||
      config.token ||
      import.meta.env.VITE_BAIDU_DH_TOKEN ||
      '';

    if (!figureId || !token) {
      console.warn(
        '[BaiduDigitalHuman] 缺少 figureId 或 token，数字人将无法正常加载。' +
          '请在 .env.production 配置 VITE_BAIDU_DH_FIGURE_ID / VITE_BAIDU_DH_TOKEN。'
      );
    }

    // 2) 构造 SDK 配置
    const sdkConfig: BaiduDHConfig = {
      token,
      figureId,
      ttsPer,
      initMode: 'noAudio', // H5 端不采集麦克风（initMode=noAudio）
      videoBg: 'rgba(0,0,0,0)', // 透明，让上层 UI 自己叠背景
      resolutionWidth: 720,
      resolutionHeight: 1080,
      // 数字人在 iframe 中居中、上半部展示
      positionV2: JSON.stringify({
        location: { top: 0, left: 0, width: 720, height: 1080 },
      }),
      preAlertSec: 120,
      inactiveDisconnectSec: 0, // 默认不自动断连，让乘客持续体验
      autoAnimoji: true,
    };

    this.sdk = new BaiduDHWebSDK(sdkConfig);
    this.sdk.onEvent((e) => this.handleSDKEvent(e));
    console.info('[BaiduDigitalHuman] SDK initialized', {
      figureId,
      ttsPer,
      tokenLen: token.length,
    });
  }

  /** React 组件挂载好 iframe 后调用，注册到 SDK */
  bindIframe(el: HTMLIFrameElement | null) {
    this.sdk?.setIframe(el);
  }

  /** 暴露给组件的 URL */
  getIframeUrl(): string {
    return this.sdk?.getUrl() || 'about:blank';
  }

  setState(state: DHState): void {
    if (this.state === state) return;
    this.state = state;
    this.emit('stateChange', state);
  }

  getState(): DHState {
    return this.state;
  }

  async speak(text: string, options?: SpeakOptions): Promise<void> {
    if (!this.sdk) {
      console.warn('[BaiduDigitalHuman] speak before init, fallback to timeout');
      await new Promise((r) => setTimeout(r, 200));
      return;
    }
    if (!text) return;
    if (options?.interrupt) this.stopSpeaking();

    this.currentCommandId = uuid();
    this.setState('speaking');
    this.emit('speakStart', text);

    this.sdk.sendText(text, this.currentCommandId);

    return new Promise((resolve) => {
      this.speakingResolver = (text: string) => {
        resolve();
        this.speakingResolver = null;
      };
      // 兜底：60s 后强制结束（避免 SDK 异常时永久挂起）
      setTimeout(() => {
        if (this.speakingResolver) {
          console.warn('[BaiduDigitalHuman] speak timeout, force end');
          this.speakingResolver('');
        }
      }, 60000);
    });
  }

  stopSpeaking(): void {
    if (!this.sdk || this.state !== 'speaking') return;
    const id = this.currentCommandId || uuid();
    this.sdk.sendInterrupt(id);
    this.speakingResolver?.('');
    this.setState('idle');
  }

  async listen(): Promise<string> {
    // initMode=noAudio，SDK 不会采集麦克风
    // 这里仅更新状态，实际 ASR 由外部 useRecorder Hook 完成
    this.setState('listening');
    this.emit('listenStart', null);
    return '';
  }

  async stopListening(): Promise<string> {
    this.emit('listenEnd', null);
    this.setState('idle');
    return '';
  }

  on(event: DHEvent, handler: DHHandler): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(handler);
  }

  destroy(): void {
    this.sdk?.destroy();
    this.sdk = null;
    this.listeners.clear();
  }

  // ───── 内部 ─────

  private handleSDKEvent(event: { type: string; content: any }) {
    const { type, content } = event;

    if (type === 'msg') {
      const { action, requestId, body } = content || {};
      if (action === 'FINISHED' && requestId === this.currentCommandId) {
        this.speakingResolver?.('');
        this.setState('idle');
        this.emit('speakEnd', body ?? null);
        this.currentCommandId = null;
      } else if (action === 'RENDER_START') {
        this.setState('speaking');
        this.emit('speakStart', body ?? null);
      } else if (action === 'RENDER_ERROR') {
        this.setState('idle');
        this.emit('error', { reason: 'render_error', detail: body });
      } else if (action === 'DISCONNECT_ALERT') {
        this.emit('disconnectAlert', null);
      } else if (action === 'TIMEOUT_EXIT') {
        this.emit('timeout', null);
      } else if (action === 'CONNECT') {
        console.info('[BaiduDigitalHuman] iframe connected');
      }
    } else if (type === 'rtcState') {
      // video 流就绪 / 静音状态变化
      if (content?.action === 'localVideoMuted' && content.body) {
        // 自动播放被浏览器拦截，提示用户点击解锁
        this.emit('error', { reason: 'autoplay_blocked' });
      }
    } else if (type === 'wsState') {
      const { readyState } = content || {};
      if (readyState === 1) {
        console.info('[BaiduDigitalHuman] WS connected');
      } else if (readyState === 2 || readyState === 3) {
        console.warn('[BaiduDigitalHuman] WS closed', readyState);
        if (this.state === 'speaking') {
          this.speakingResolver?.('');
          this.setState('idle');
        }
      }
    }
  }

  private emit(event: DHEvent, data: any) {
    const handlers = this.listeners.get(event);
    if (handlers) handlers.forEach((h) => h(data));
  }
}
