import type { VideoClip, VlogTheme } from '@/types';

export interface CanvasComposeOptions {
  theme: VlogTheme;
  watermark?: string;
  width?: number;
  height?: number;
  fps?: number;
  onProgress?: (progress: number, stage?: string) => void;
}

/**
 * 使用 Canvas + MediaRecorder 合成视频
 * 1. 加载所有视频片段
 * 2. 逐帧绘制到 Canvas（应用主题色/滤镜/水印）
 * 3. 通过 canvas.captureStream() + MediaRecorder 录制为 WebM
 */
export async function composeWithCanvas(
  clips: VideoClip[],
  options: CanvasComposeOptions
): Promise<Blob> {
  const width = options.width ?? 1080;
  const height = options.height ?? 1920;
  const fps = options.fps ?? 24;
  const totalDuration = clips.reduce((sum, c) => sum + c.duration, 0);
  const totalFrames = Math.ceil(totalDuration * fps);

  // 创建Canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 预加载视频
  const videoElements: HTMLVideoElement[] = await Promise.all(
    clips.map((clip) => loadVideoElement(clip.url))
  );

  // 配置MediaRecorder
  const stream = canvas.captureStream(fps);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: getSupportedMimeType(),
    videoBitsPerSecond: 2_500_000,
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise<Blob>((resolve) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: getSupportedMimeType() });
      // 清理
      videoElements.forEach((v) => {
        v.pause();
        v.src = '';
      });
      resolve(blob);
    };

    mediaRecorder.start();

    // 启动所有视频
    videoElements.forEach((v) => v.play().catch(() => {}));

    let frame = 0;
    let currentClipIndex = 0;
    let clipStartTime = 0;

    const drawFrame = () => {
      const currentTime = frame / fps;

      // 找到当前播放的片段
      let elapsed = 0;
      currentClipIndex = 0;
      for (let i = 0; i < clips.length; i++) {
        if (currentTime >= elapsed && currentTime < elapsed + clips[i].duration) {
          currentClipIndex = i;
          clipStartTime = elapsed;
          break;
        }
        elapsed += clips[i].duration;
      }

      const currentVideo = videoElements[currentClipIndex];
      const currentClip = clips[currentClipIndex];

      // 绘制背景
      drawBackground(ctx, width, height, options.theme);

      // 绘制视频帧
      if (currentVideo && currentVideo.readyState >= 2) {
        try {
          ctx.save();
          applyFilter(ctx, options.theme.filter, width, height);
          // 计算视频绘制区域（保持比例）
          const vw = currentVideo.videoWidth;
          const vh = currentVideo.videoHeight;
          const scale = Math.max(width / vw, height / vh);
          const dw = vw * scale;
          const dh = vh * scale;
          const dx = (width - dw) / 2;
          const dy = (height - dh) / 2;
          ctx.drawImage(currentVideo, dx, dy, dw, dh);
          ctx.restore();
        } catch (e) {
          drawPlaceholder(ctx, width, height, currentClip, options.theme);
        }
      } else {
        drawPlaceholder(ctx, width, height, currentClip, options.theme);
      }

      // 绘制水印
      if (options.watermark) {
        drawWatermark(ctx, width, height, options.watermark, options.theme);
      }

      // 进度反馈
      if (frame % 6 === 0) {
        options.onProgress?.(frame / totalFrames);
      }

      frame++;
      if (frame < totalFrames) {
        requestAnimationFrame(drawFrame);
      } else {
        mediaRecorder.stop();
      }
    };

    drawFrame();
  });
}

function loadVideoElement(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';

    let resolved = false;
    const onReady = () => {
      if (!resolved) {
        resolved = true;
        resolve(video);
      }
    };

    video.addEventListener('loadeddata', onReady);
    video.addEventListener('error', () => {
      // 文件加载失败时仍返回video对象，由降级逻辑处理
      onReady();
    });

    // 5秒超时
    setTimeout(onReady, 5000);
  });
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: VlogTheme
) {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, theme.primaryColor);
  grad.addColorStop(1, theme.secondaryColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  clip: VideoClip,
  theme: VlogTheme
) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.font = `${Math.min(width, height) * 0.05}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(clip.title || '精彩瞬间', width / 2, height / 2);

  ctx.font = `${Math.min(width, height) * 0.025}px sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText('AI为您记录', width / 2, height / 2 + 50);

  // 主题色装饰
  ctx.fillStyle = theme.primaryColor;
  ctx.font = `${Math.min(width, height) * 0.06}px serif`;
  ctx.fillText(theme.name, width / 2, height * 0.15);
}

function applyFilter(
  ctx: CanvasRenderingContext2D,
  filter: VlogTheme['filter'],
  width: number,
  height: number
) {
  // 注意：此函数仅做占位，实际滤镜应在绘制前设置 globalCompositeOperation
  // 或在 drawImage 后通过 ImageData 处理
  switch (filter) {
    case 'ink':
      ctx.filter = 'grayscale(0.3) contrast(1.1) brightness(0.95)';
      break;
    case 'vintage':
      ctx.filter = 'sepia(0.3) contrast(1.05) saturate(1.2)';
      break;
    case 'night':
      ctx.filter = 'brightness(0.7) contrast(1.2) hue-rotate(200deg)';
      break;
    case 'fresh':
      ctx.filter = 'saturate(1.2) brightness(1.05)';
      break;
  }
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  theme: VlogTheme
) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = `${Math.min(width, height) * 0.02}px sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(text, width - 24, 24);
  ctx.restore();
}

function getSupportedMimeType(): string {
  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return 'video/webm';
}
