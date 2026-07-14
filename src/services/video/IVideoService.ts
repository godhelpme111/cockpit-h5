import type { VideoClip, VlogTheme, BGM } from '@/types';

export interface ComposeOptions {
  theme: VlogTheme;
  bgm?: BGM;
  watermark?: string;        // 水印文字
  width?: number;
  height?: number;
  fps?: number;
  onProgress?: (progress: number, stage: string) => void;
}

export interface ComposeResult {
  blob: Blob;
  url: string;              // ObjectURL
  duration: number;
  coverUrl?: string;
}

export interface IVideoService {
  /** 合成Vlog */
  compose(clips: VideoClip[], options: ComposeOptions): Promise<ComposeResult>;
  /** 导出MP4 */
  exportAsMp4(blob: Blob): Promise<Blob>;
  /** 上传到云端（生产环境） */
  uploadToCloud?(blob: Blob): Promise<string>;
}
