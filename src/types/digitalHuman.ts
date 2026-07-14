// 数字人相关类型

export type DHState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface DHConfig {
  avatarId: string;       // 数字人形象ID
  voiceId: string;        // 音色ID
  language: 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR';
  lipSync: boolean;       // 是否启用口型同步
}

export interface SpeakOptions {
  interrupt?: boolean;    // 是否打断当前播放
  emotion?: 'neutral' | 'happy' | 'sad' | 'surprised';
  speed?: number;         // 语速 0.5~2.0
}

export type DHEvent =
  | 'stateChange'
  | 'speakStart'
  | 'speakEnd'
  | 'listenStart'
  | 'listenEnd'
  | 'error';

export type DHHandler = (data: any) => void;
