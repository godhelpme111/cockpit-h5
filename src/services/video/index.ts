import type { IVideoService, ComposeResult } from './IVideoService';
import { MockVideoService } from './MockVideo';
import { TencentVideoService } from './TencentVideo';

const mode = import.meta.env.VITE_TENCENT_SDK_MODE ?? 'mock';

function createService(): IVideoService {
  if (mode === 'real') {
    console.log('[VideoService] 使用真实腾讯云SDK');
    return new TencentVideoService();
  }
  console.log('[VideoService] 使用Mock视频合成');
  return new MockVideoService();
}

export const videoService: IVideoService = createService();

export type { IVideoService, ComposeResult };
