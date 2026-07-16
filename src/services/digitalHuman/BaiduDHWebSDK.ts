/**
 * 百度智能云数字人 WebSDK 封装
 * ─────────────────────────────────────────────────────
 * 百度数字人通过 iframe 加载 + postMessage 双向通信：
 *   父页 → iframe:  { type: 'command' | 'message', content: { ... } }
 *   iframe → 父页:  { type: 'rtcState' | 'wsState' | 'msg', content: { ... } }
 *
 * 本类只负责"造 URL + 通信"，不关心 UI 渲染。React 组件负责把 iframe 挂到 DOM。
 *
 * URL 模板：
 *   https://open.xiling.baidu.com/cloud/realtime?token=...&figureId=...&...
 *
 * 重要参数：
 *   - figureId:    决定用哪个数字人形象（"形象"）
 *   - token:       鉴权凭证（<appId>/<accessToken>/<expiry>）
 *   - ttsPer:      音色 ID
 *   - initMode:    noAudio（无拾音）/ mic（带麦克风）
 *   - videoBg:     数字人背后的填充色
 *   - resolutionWidth/Height: 视频分辨率
 *   - backgroundImageUrl: 自定义背景图
 *   - cp-positionV2: 数字人在视频中的位置和大小（JSON 字符串）
 *
 * 完整参数说明见代码包 README.md。
 */

export interface BaiduDHConfig {
  /** 鉴权 token，格式 <appId>/<accessToken>/<expiryISO> */
  token: string;
  /** 数字人形象 ID，决定显示哪个"人" */
  figureId: string;
  /** 音色 ID（百度平台下发） */
  ttsPer: string;
  /** 初始化模式：noAudio = 仅展示数字人、不采集麦克风；mic = 含拾音 */
  initMode?: 'noAudio' | 'mic';
  /** 数字人背后填充色，CSS 颜色字符串 */
  videoBg?: string;
  /** 视频分辨率宽 */
  resolutionWidth?: number;
  /** 视频分辨率高 */
  resolutionHeight?: number;
  /** 自定义背景图 URL（用于替换 videoBg） */
  backgroundImageUrl?: string;
  /** 数字人在视频中的位置和大小，JSON 字符串 */
  positionV2?: string;
  /** 无交互超时（秒）后断连 */
  inactiveDisconnectSec?: number;
  /** 断连前多少秒发提醒 */
  preAlertSec?: number;
  /** 音调 1-10 */
  ttsPitch?: number;
  /** 语速 1-10 */
  ttsSpeed?: number;
  /** 音量 1-10 */
  ttsVolume?: number;
  /** 是否开启自动肢体动作 */
  autoAnimoji?: boolean;
}

export type BaiduDHMessageEvent = {
  type: 'rtcState' | 'wsState' | 'msg';
  content: any;
};

export type BaiduDHErrorEvent = {
  type: 'error';
  content: { code: number; message: string };
};

/** 暴露给上层的事件回调 */
export type BaiduDHEvent = BaiduDHMessageEvent | BaiduDHErrorEvent;
export type BaiduDHEventHandler = (event: BaiduDHEvent) => void;

export const BAIDU_DH_IFRAME_BASE = 'https://open.xiling.baidu.com/cloud/realtime';

/** 百度侧会 postMessage 过来的合法 origin */
const BAIDU_ORIGINS = [
  'https://open.xiling.baidu.com',
];

function isBaiduOrigin(origin: string): boolean {
  if (BAIDU_ORIGINS.includes(origin)) return true;
  // 兼容 persona.baidu.com 子域
  if (origin.endsWith('.persona.baidu.com')) return true;
  return false;
}

export class BaiduDHWebSDK {
  private config: BaiduDHConfig;
  private iframe: HTMLIFrameElement | null = null;
  private handlers: BaiduDHEventHandler[] = [];
  private readyResolvers: Array<() => void> = [];
  private ready = false;
  private boundOnMessage: (e: MessageEvent) => void;

  constructor(config: BaiduDHConfig) {
    this.config = { initMode: 'noAudio', ...config };
    this.boundOnMessage = this.onMessage.bind(this);
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.boundOnMessage);
    }
  }

  /** 拼出 iframe 完整 URL（不包含 host 前缀的 pathname 是固定的） */
  buildUrl(): string {
    const params = new URLSearchParams();
    const cfg = this.config;
    // 基础参数
    params.set('token', cfg.token);
    params.set('figureId', cfg.figureId);
    if (cfg.ttsPer) params.set('ttsPer', cfg.ttsPer);
    if (cfg.initMode) params.set('initMode', cfg.initMode);
    if (cfg.videoBg) params.set('videoBg', cfg.videoBg);
    if (cfg.resolutionWidth) params.set('resolutionWidth', String(cfg.resolutionWidth));
    if (cfg.resolutionHeight) params.set('resolutionHeight', String(cfg.resolutionHeight));
    if (cfg.backgroundImageUrl) params.set('backgroundImageUrl', cfg.backgroundImageUrl);
    if (cfg.positionV2) params.set('cp-positionV2', cfg.positionV2);
    if (cfg.inactiveDisconnectSec !== undefined) {
      params.set('cp-inactiveDisconnectSec', String(cfg.inactiveDisconnectSec));
    }
    if (cfg.preAlertSec !== undefined) {
      params.set('cp-preAlertSec', String(cfg.preAlertSec));
    }
    if (cfg.ttsPitch !== undefined) params.set('ttsPitch', String(cfg.ttsPitch));
    if (cfg.ttsSpeed !== undefined) params.set('ttsSpeed', String(cfg.ttsSpeed));
    if (cfg.ttsVolume !== undefined) params.set('ttsVolume', String(cfg.ttsVolume));
    if (cfg.autoAnimoji !== undefined) params.set('cp-autoAnimoji', String(cfg.autoAnimoji));
    return `${BAIDU_DH_IFRAME_BASE}?${params.toString()}`;
  }

  getConfig(): BaiduDHConfig { return this.config; }
  getUrl(): string { return this.buildUrl(); }

  /** React 组件挂载好 iframe 后调用此方法注册 iframe ref */
  setIframe(el: HTMLIFrameElement | null) {
    this.iframe = el;
    // 如果已 ready 但 iframe 重新挂载（比如重新加载），清掉 ready 状态
    if (!el) this.ready = false;
  }

  /** 监听 rtcState.remoteVideoConnected 后会 resolve */
  whenReady(): Promise<void> {
    if (this.ready) return Promise.resolve();
    return new Promise((resolve) => this.readyResolvers.push(resolve));
  }

  onEvent(handler: BaiduDHEventHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  // ───── 发送 ─────

  /** 发送 text 驱动数字人播报 */
  sendText(text: string, requestId: string): boolean {
    return this.postToIframe('message', {
      action: 'TEXT_RENDER',
      body: text,
      requestId,
    });
  }

  /** 打断当前播报 */
  sendInterrupt(requestId: string): boolean {
    return this.sendText('<interrupt></interrupt>', requestId);
  }

  /** 静音 / 取消静音（数字人视频本身的音频） */
  setMute(muted: boolean): boolean {
    return this.postToIframe('command', {
      subType: 'muteAudio',
      subContent: muted,
    });
  }

  /** 播放/暂停视频（一般用于"取消自动播放限制"场景） */
  playVideo(play: boolean): boolean {
    return this.postToIframe('command', {
      subType: 'playVideo',
      subContent: play,
    });
  }

  /** 销毁：解绑事件、清理 ref */
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this.boundOnMessage);
    }
    this.handlers = [];
    this.readyResolvers = [];
    this.iframe = null;
    this.ready = false;
  }

  // ───── 内部 ─────

  private postToIframe(type: 'message' | 'command', content: any): boolean {
    if (!this.iframe?.contentWindow) {
      console.warn('[BaiduDHWebSDK] iframe not mounted yet, drop message', { type, content });
      return false;
    }
    this.iframe.contentWindow.postMessage({ type, content }, '*');
    return true;
  }

  private onMessage(event: MessageEvent) {
    if (!isBaiduOrigin(event.origin)) return;
    const data = event.data;
    if (!data || typeof data !== 'object' || !data.type) return;

    const { type, content } = data;
    if (type === 'rtcState' && content?.action === 'remoteVideoConnected' && !this.ready) {
      this.ready = true;
      const resolvers = this.readyResolvers;
      this.readyResolvers = [];
      resolvers.forEach((r) => r());
    }

    // 派发给所有订阅者
    this.handlers.forEach((h) => {
      try {
        h({ type, content });
      } catch (e) {
        console.error('[BaiduDHWebSDK] handler error:', e);
      }
    });
  }
}
