import type { IDigitalHuman } from './IDigitalHuman';
import type { DHState, DHConfig, SpeakOptions, DHEvent, DHHandler } from '@/types';

/**
 * Mock 数字人实现
 * - 状态切换：模拟
 * - speak: 使用浏览器原生 SpeechSynthesis API
 * - listen: 返回预录文本（在外部通过录音Hook控制）
 */
export class MockDigitalHuman implements IDigitalHuman {
  private state: DHState = 'idle';
  private config: DHConfig | null = null;
  private listeners: Map<DHEvent, DHHandler[]> = new Map();
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeningResolver: ((text: string) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  async init(config: DHConfig): Promise<void> {
    this.config = config;
    console.log('[MockDigitalHuman] 初始化完成', config);
  }

  setState(state: DHState): void {
    if (this.state === state) return;
    this.state = state;
    this.emit('stateChange', state);
  }

  getState(): DHState {
    return this.state;
  }

  async speak(text: string, options: SpeakOptions = {}): Promise<void> {
    if (!this.synth) {
      console.warn('[MockDigitalHuman] 浏览器不支持 SpeechSynthesis');
      return;
    }

    if (options.interrupt) {
      this.stopSpeaking();
    }

    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.config?.language || 'zh-CN';
      utterance.rate = options.speed ?? 1.0;
      utterance.pitch = 1.1; // 古风音色调高一点

      // 尝试选择女声
      const voices = this.synth!.getVoices();
      const chineseVoice = voices.find(
        (v) => v.lang.startsWith('zh') && /female|woman|女/i.test(v.name)
      ) || voices.find((v) => v.lang.startsWith('zh'));
      if (chineseVoice) {
        utterance.voice = chineseVoice;
      }

      this.currentUtterance = utterance;
      this.setState('speaking');
      this.emit('speakStart', text);

      utterance.onend = () => {
        this.setState('idle');
        this.emit('speakEnd', text);
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = () => {
        this.setState('idle');
        this.currentUtterance = null;
        resolve();
      };

      this.synth!.speak(utterance);
    });
  }

  stopSpeaking(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      this.setState('idle');
      this.currentUtterance = null;
    }
  }

  async listen(): Promise<string> {
    this.setState('listening');
    this.emit('listenStart', null);
    // 真实录音由外部 useRecorder Hook 控制
    // 此方法只设置状态，实际 ASR 由 useRecorder 完成后调用 setListenResult
    return new Promise<string>((resolve) => {
      this.listeningResolver = resolve;
    });
  }

  async stopListening(): Promise<string> {
    this.emit('listenEnd', null);
    this.setState('thinking');
    // 外部调用方需要将 ASR 结果通过 setListenResult 传回
    return new Promise<string>((resolve) => {
      const original = this.listeningResolver;
      this.listeningResolver = (text: string) => {
        original?.(text);
        resolve(text);
      };
      // 兜底：3秒后自动返回空
      setTimeout(() => {
        if (this.listeningResolver) {
          this.listeningResolver('');
          this.listeningResolver = null;
        }
      }, 3000);
    });
  }

  /** 由外部录音Hook调用，传入ASR结果 */
  setListenResult(text: string): void {
    if (this.listeningResolver) {
      this.listeningResolver(text);
      this.listeningResolver = null;
    }
  }

  on(event: DHEvent, handler: DHHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }

  private emit(event: DHEvent, data: any): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((h) => h(data));
    }
  }

  destroy(): void {
    this.stopSpeaking();
    this.listeners.clear();
    this.synth = null;
  }
}
