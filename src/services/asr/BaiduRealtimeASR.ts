/**
 * 百度智能云 · 实时流式 ASR（WebSocket 版）
 * ─────────────────────────────────────────────
 * 文档：https://ai.baidu.com/ai-doc/SPEECH/Vk38lxily
 *
 * 协议：
 *   1) client → server: 文本帧 `{type:"START", data:{dev_pid, format, sample, ...}}`
 *   2) client → server: 二进制帧 PCM (16k, 16bit, mono)
 *   3) client → server: 文本帧 `{type:"END"}`
 *   4) server → client: 文本帧 `{err_no, type:"MID_TEXT"|"FIN_TEXT", result}`
 *
 * 鉴权：
 *   1) 用 API Key + Secret Key 调 https://aip.baidubce.com/oauth/2.0/token
 *   2) 拿到 access_token 后拼接：wss://vop.baidu.com/realtime_asr?token=xxx&...
 */

const TOKEN_URL = 'https://aip.baidubce.com/oauth/2.0/token';
const WSS_URL = 'wss://vop.baidu.com/realtime_asr';

export type ASRDevPid =
  | 1537 // 中文普通话
  | 1536 // 中文普通话（搜索模型）
  | 1737 // 英语
  | 1637 // 粤语
  | 1837 // 四川话
  | 1936 // 普通话远场模型;

export interface BaiduRealtimeASRConfig {
  /** 百度智能云应用的 API Key */
  apiKey: string;
  /** 百度智能云应用的 Secret Key */
  secretKey: string;
  /** 识别模型，默认 1537（普通话） */
  devPid?: ASRDevPid;
  /** 采样率，必须与实际音频一致，默认 16000 */
  sampleRate?: 16000 | 8000;
  cuid?: string;
}

export interface ASREvent {
  type: 'open' | 'partial' | 'final' | 'error' | 'close';
  text?: string;
  error?: string;
  /** 临时/最终结果对应的累计全文（partial 含历史） */
  accumulated?: string;
  /** 帧索引（仅 partial 携带） */
  sn?: string;
}

type Handler = (e: ASREvent) => void;

interface StartOptions {
  sampleRate?: 16000 | 8000;
  devPid?: ASRDevPid;
}

export class BaiduRealtimeASR {
  private config: BaiduRealtimeASRConfig;
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private tokenExpiresAt = 0;
  private handlers: Handler[] = [];
  private started = false;
  private cuid: string;

  constructor(config: BaiduRealtimeASRConfig) {
    this.config = config;
    this.cuid = config.cuid || `browser-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  onEvent(h: Handler) {
    this.handlers.push(h);
  }

  offEvent(h: Handler) {
    this.handlers = this.handlers.filter((x) => x !== h);
  }

  private emit(e: ASREvent) {
    for (const h of this.handlers) {
      try {
        h(e);
      } catch (err) {
        console.error('[BaiduRealtimeASR] handler error', err);
      }
    }
  }

  /**
   * 获取 access_token（带 60s 提前刷新的内存缓存）
   */
  private async fetchToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiresAt - 60_000) {
      return this.token;
    }
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.apiKey,
      client_secret: this.config.secretKey,
    });
    const res = await fetch(`${TOKEN_URL}?${params.toString()}`, {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error(`Baidu token HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!data.access_token) {
      throw new Error(`Baidu token error: ${JSON.stringify(data)}`);
    }
    this.token = data.access_token as string;
    this.tokenExpiresAt = Date.now() + (data.expires_in || 2592000) * 1000;
    return this.token;
  }

  /**
   * 连接 WebSocket 并发送 START 帧
   */
  async connect(opts: StartOptions = {}): Promise<void> {
    if (this.started) return;
    const token = await this.fetchToken();
    const sampleRate = opts.sampleRate ?? this.config.sampleRate ?? 16000;
    const devPid = opts.devPid ?? this.config.devPid ?? 1537;

    const params = new URLSearchParams({
      sn: `${Date.now()}`,
      product: 'cockpit-h5',
      token,
    });
    const url = `${WSS_URL}?${params.toString()}`;

    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(url);
      this.ws = ws;

      const onOpen = () => {
        // 发送 START 帧
        const startPayload = {
          type: 'START',
          data: {
            appid: 0,
            appkey: '',
            dev_pid: devPid,
            cuid: this.cuid,
            format: 'pcm',
            sample: sampleRate,
            bit: '16',
            channel: '1',
            token,
            seg_sn: this.cuid,
            speech_noise_threshold: -1,
            vad_sn: '',
          },
        };
        ws.send(JSON.stringify(startPayload));
        this.started = true;
        this.emit({ type: 'open' });
        resolve();
      };

      const onError = (ev: Event) => {
        this.emit({ type: 'error', error: `WebSocket error: ${(ev as ErrorEvent).message || 'unknown'}` });
        reject(new Error('WebSocket connect failed'));
      };

      const onClose = (ev: CloseEvent) => {
        this.started = false;
        this.ws = null;
        this.emit({ type: 'close', error: ev.reason || `code=${ev.code}` });
      };

      const onMessage = (ev: MessageEvent) => {
        if (typeof ev.data !== 'string') return;
        try {
          const msg = JSON.parse(ev.data);
          if (msg.err_no !== 0) {
            this.emit({ type: 'error', error: `ASR err_no=${msg.err_no}: ${msg.err_msg}` });
            return;
          }
          if (msg.type === 'MID_TEXT') {
            this.emit({
              type: 'partial',
              text: msg.result,
              accumulated: msg.result,
              sn: msg.sn,
            });
          } else if (msg.type === 'FIN_TEXT') {
            this.emit({
              type: 'final',
              text: msg.result,
              accumulated: msg.result,
              sn: msg.sn,
            });
          }
        } catch (err) {
          console.warn('[BaiduRealtimeASR] parse message failed', err, ev.data);
        }
      };

      ws.addEventListener('open', onOpen, { once: true });
      ws.addEventListener('error', onError, { once: true });
      ws.addEventListener('close', onClose);
      ws.addEventListener('message', onMessage);
    });
  }

  /**
   * 推送一段 PCM 数据（Int16Array 或 ArrayBuffer）
   * 建议每帧 ~200ms（即 16000Hz × 0.2s = 3200 samples = 6400 bytes）
   */
  sendPcm(pcm: ArrayBuffer | Int16Array): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.started) return;
    const buf = pcm instanceof Int16Array ? pcm.buffer.slice(pcm.byteOffset, pcm.byteOffset + pcm.byteLength) : pcm;
    this.ws.send(buf);
  }

  /**
   * 发送 END 帧，结束本次识别
   */
  end(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: 'END' }));
      } catch (err) {
        console.warn('[BaiduRealtimeASR] send END failed', err);
      }
    }
  }

  /**
   * 强制关闭
   */
  close(): void {
    this.started = false;
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        /* ignore */
      }
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /** 是否已配置 API Key / Secret Key（即使 env 留空也能返回实例，但 connect 前需要先填好） */
  isConfigured(): boolean {
    return Boolean(this.config.apiKey) && Boolean(this.config.secretKey);
  }
}
