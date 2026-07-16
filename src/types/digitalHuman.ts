// 数字人相关类型

export type DHState = 'idle' | 'listening' | 'thinking' | 'speaking';

/**
 * 数字人配置
 * 兼容旧字段（avatarId / voiceId），同时支持新字段（figureId / ttsPer / token）。
 *   avatarId  → figureId  (新 SDK 用这个)
 *   voiceId   → ttsPer     (新 SDK 用这个)
 */
export interface DHConfig {
  // 兼容旧字段
  avatarId?: string;
  voiceId?: string;
  // 新字段（百度数字人 WebSDK）
  figureId?: string;
  ttsPer?: string;
  /** 鉴权 token（<appId>/<accessToken>/<expiry>），不传则从环境变量读 */
  token?: string;
  // 通用
  language: 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR';
  lipSync: boolean;
}

export interface SpeakOptions {
  interrupt?: boolean;
  emotion?: 'neutral' | 'happy' | 'sad' | 'surprised';
  speed?: number;
}

export type DHEvent =
  | 'stateChange'
  | 'speakStart'
  | 'speakEnd'
  | 'listenStart'
  | 'listenEnd'
  | 'error'
  /** 数字人即将超时（来自 SDK 的 DISCONNECT_ALERT） */
  | 'disconnectAlert'
  /** 数字人已超时退出（来自 SDK 的 TIMEOUT_EXIT） */
  | 'timeout';

export type DHHandler = (data: any) => void;
