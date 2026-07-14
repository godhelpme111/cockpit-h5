import type { IVideoService, ComposeOptions, ComposeResult } from './IVideoService';
import type { VideoClip } from '@/types';

/**
 * 腾讯云 短视频SDK 实现（占位）
 *
 * 真实集成流程：
 * 1. 服务端签名获取上传凭证
 * 2. 客户端使用 @tencent/ugc-sdk 进行本地导入/裁剪/拼接
 * 3. 上传至腾讯云点播（VOD）服务
 * 4. 提交云端转码/AI剪辑任务
 * 5. 轮询任务结果获取合成后的MP4 URL
 */
export class TencentVideoService implements IVideoService {
  async compose(
    clips: VideoClip[],
    options: ComposeOptions
  ): Promise<ComposeResult> {
    const { onProgress } = options;

    onProgress?.(0.1, '上传素材到腾讯云...');
    // TODO: 调用腾讯云UGC SDK
    await new Promise((r) => setTimeout(r, 1000));

    onProgress?.(0.3, '服务端合成中...');
    await new Promise((r) => setTimeout(r, 2000));

    onProgress?.(0.7, 'AI智能剪辑...');
    await new Promise((r) => setTimeout(r, 1500));

    onProgress?.(1.0, '完成');

    // 占位返回
    const blob = new Blob([], { type: 'video/mp4' });
    return {
      blob,
      url: 'https://example.com/tencent-vod/output.mp4',
      duration: clips.reduce((sum, c) => sum + c.duration, 0),
    };
  }

  async exportAsMp4(blob: Blob): Promise<Blob> {
    return blob;
  }
}
