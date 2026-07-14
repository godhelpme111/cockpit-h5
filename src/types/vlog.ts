// Vlog 相关类型

export type ClipDirection = 'front' | 'left' | 'right' | 'back';
export type ClipCategory = 'landscape' | 'architecture' | 'culture' | 'animal' | 'night';

export interface VideoClip {
  id: string;
  direction: ClipDirection;
  category: ClipCategory;
  duration: number;       // 秒
  url: string;
  thumbnail?: string;
  tags?: string[];
  title?: string;
}

export type ThemeId = 'ink-painting' | 'prosperity' | 'night-bright';

export interface VlogTheme {
  id: ThemeId;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  bgmId: string;
  filter: 'ink' | 'vintage' | 'night' | 'fresh';
  textEffect: 'calligraphy' | 'modern' | 'glow';
  preview?: string;
}

export interface BGM {
  id: string;
  name: string;
  url: string;
  duration: number;
  mood: string;
}

export interface VlogProject {
  id: string;
  themeId: ThemeId;
  bgmId: string;
  filter: VlogTheme['filter'];
  clips: VideoClip[];
  createdAt: number;
  duration: number;       // 总时长
  status: 'draft' | 'composing' | 'completed' | 'failed';
  outputUrl?: string;     // 生成后的MP4 URL
  coverUrl?: string;      // 封面图
}
