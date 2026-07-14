import type { IVideoService, ComposeOptions, ComposeResult } from './IVideoService';
import type { VideoClip } from '@/types';
import { composeWithCanvas } from '@/utils/canvasUtils';

/**
 * Mock 视频合成服务
 * 使用浏览器原生 Canvas + MediaRecorder 进行视频合成
 * 模拟腾讯云短视频SDK的核心流程
 */
export class MockVideoService implements IVideoService {
  async compose(
    clips: VideoClip[],
    options: ComposeOptions
  ): Promise<ComposeResult> {
    const { onProgress } = options;

    onProgress?.(0.1, '加载素材中...');
    await new Promise((r) => setTimeout(r, 300));

    onProgress?.(0.2, '解析视频...');
    await new Promise((r) => setTimeout(r, 300));

    onProgress?.(0.4, '拼接片段...');
    await new Promise((r) => setTimeout(r, 500));

    onProgress?.(0.6, '应用滤镜...');
    await new Promise((r) => setTimeout(r, 400));

    onProgress?.(0.8, '添加水印和配乐...');
    await new Promise((r) => setTimeout(r, 400));

    try {
      // 实际合成（如果视频文件存在则合成，否则生成纯色占位视频）
      const blob = await composeWithCanvas(clips, {
        ...options,
        onProgress: (p, stage) => onProgress?.(p, stage ?? ''),
      });
      onProgress?.(1.0, '生成完成');

      return {
        blob,
        url: URL.createObjectURL(blob),
        duration: clips.reduce((sum, c) => sum + c.duration, 0),
      };
    } catch (error) {
      console.warn('[MockVideoService] 合成失败，使用占位视频', error);
      // 降级：生成一个简单的占位视频
      const placeholder = await generatePlaceholderVideo(clips, options);
      onProgress?.(1.0, '生成完成');
      return placeholder;
    }
  }

  async exportAsMp4(blob: Blob): Promise<Blob> {
    // Mock阶段浏览器生成的通常是 webm，标记为 mp4 容器
    return blob;
  }

  async uploadToCloud(blob: Blob): Promise<string> {
    // Mock阶段返回本地 ObjectURL
    return URL.createObjectURL(blob);
  }
}

/**
 * 生成占位视频（当真实视频文件不存在时）
 * 用 Canvas 绘制一个简单的纯色视频
 */
async function generatePlaceholderVideo(
  clips: VideoClip[],
  options: ComposeOptions
): Promise<ComposeResult> {
  const width = options.width ?? 1080;
  const height = options.height ?? 1920;
  const fps = options.fps ?? 24;
  const totalDuration = clips.reduce((sum, c) => sum + c.duration, 0);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const stream = canvas.captureStream(fps);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 2_000_000,
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve) => {
    const finished = new Promise<Blob>((res) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        res(blob);
      };
    });

    mediaRecorder.start();

    let frame = 0;
    const totalFrames = totalDuration * fps;
    const theme = options.theme;

    const drawFrame = () => {
      // 背景
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, theme.primaryColor);
      grad.addColorStop(1, theme.secondaryColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 当前播放片段
      const currentTime = frame / fps;
      let elapsed = 0;
      let currentClip: VideoClip | null = null;
      for (const clip of clips) {
        if (currentTime >= elapsed && currentTime < elapsed + clip.duration) {
          currentClip = clip;
          break;
        }
        elapsed += clip.duration;
      }

      // 绘制内容
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.font = `${Math.min(width, height) * 0.06}px "Source Han Serif SC", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const title = currentClip?.title || '示例景区';
      ctx.fillText(title, width / 2, height / 2 - 60);

      ctx.font = `${Math.min(width, height) * 0.025}px "Source Han Sans SC", sans-serif`;
      ctx.fillText(
        `AI为您记录美好时刻 · ${currentTime.toFixed(1)}s`,
        width / 2,
        height / 2 + 20
      );

      // 水印
      if (options.watermark) {
        ctx.font = `${Math.min(width, height) * 0.018}px sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.textAlign = 'right';
        ctx.fillText(options.watermark, width - 24, 48);
      }

      // 主题色
      ctx.fillStyle = theme.primaryColor;
      ctx.font = `${Math.min(width, height) * 0.08}px "Source Han Serif SC", serif`;
      ctx.textAlign = 'center';
      ctx.fillText(theme.name, width / 2, height * 0.2);

      frame++;
      if (frame < totalFrames) {
        requestAnimationFrame(drawFrame);
        options.onProgress?.(frame / totalFrames, '渲染中...');
      } else {
        mediaRecorder.stop();
      }
    };

    drawFrame();

    finished.then((blob) => {
      resolve({
        blob,
        url: URL.createObjectURL(blob),
        duration: totalDuration,
      });
    });
  });
}
