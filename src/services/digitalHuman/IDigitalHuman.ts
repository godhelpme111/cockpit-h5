import type { DHState, DHConfig, SpeakOptions, DHEvent, DHHandler } from '@/types';

export interface IDigitalHuman {
  /** 初始化 */
  init(config: DHConfig): Promise<void>;
  /** 设置数字人状态 */
  setState(state: DHState): void;
  /** 获取当前状态 */
  getState(): DHState;
  /** 文字转语音并播放，数字人配合口型 */
  speak(text: string, options?: SpeakOptions): Promise<void>;
  /** 停止当前播放 */
  stopSpeaking(): void;
  /** 开始监听（录音），返回ASR识别结果 */
  listen(): Promise<string>;
  /** 停止监听 */
  stopListening(): Promise<string>;
  /** 事件订阅 */
  on(event: DHEvent, handler: DHHandler): void;
  /** 销毁 */
  destroy(): void;
}
