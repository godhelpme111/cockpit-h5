/**
 * useRealtimeASR
 * ─────────────
 * 麦克风 → AudioContext（16kHz/16bit/mono 重采样）→ 推送给百度实时 ASR
 * 同时输出振幅给 UI 做波形动画。
 *
 * 关键点：
 *  - 浏览器 AudioContext 默认采样率可能为 44100/48000，必须重采样到 16000 才能匹配 ASR
 *  - 使用 ScriptProcessor（兼容性最广，AudioWorklet 在低版本浏览器不可用）
 *  - 每 200ms 推送一帧 PCM 给 ASR
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { calculateAmplitude } from '@/utils/audioUtils';
import { getBaiduASR, isBaiduASREnabled, type ASREvent } from '@/services/asr';

interface UseRealtimeASRReturn {
  /** 是否正在录音+识别 */
  recording: boolean;
  /** 实时振幅 0~1（给波形组件用） */
  amplitude: number;
  /** 累计识别出的临时文本（partial） */
  partialText: string;
  /** 最近一次最终识别结果 */
  finalText: string;
  /** 错误信息 */
  error: string | null;
  /** 当前是否连上 ASR 服务 */
  connected: boolean;
  /** 开始录音+识别（按下麦克风时调用） */
  start: () => Promise<void>;
  /** 结束录音+识别，返回最终文本（松开麦克风时调用） */
  stop: () => Promise<string>;
  /** 强制取消（异常时） */
  cancel: () => void;
}

const TARGET_SAMPLE_RATE = 16000;

export function useRealtimeASR(): UseRealtimeASRReturn {
  const [recording, setRecording] = useState(false);
  const [amplitude, setAmplitude] = useState(0);
  const [partialText, setPartialText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const pcmBufferRef = useRef<Int16Array[]>([]);

  const resolveStopRef = useRef<((text: string) => void) | null>(null);

  // 清理
  const cleanup = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
      const asr = getBaiduASR();
      asr.close();
    };
  }, [cleanup]);

  const handleASREvent = useCallback((e: ASREvent) => {
    if (e.type === 'open') {
      setConnected(true);
    } else if (e.type === 'partial') {
      setPartialText(e.text || '');
    } else if (e.type === 'final') {
      const txt = e.text || '';
      setFinalText(txt);
      setPartialText('');
    } else if (e.type === 'error') {
      setError(e.error || 'ASR error');
    } else if (e.type === 'close') {
      setConnected(false);
    }
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setPartialText('');
    setFinalText('');
    setAmplitude(0);
    pcmBufferRef.current = [];

    const asr = getBaiduASR();
    if (!asr.isConfigured()) {
      setError('未配置百度 ASR 凭证（VITE_BAIDU_ASR_API_KEY / SECRET_KEY）');
      return;
    }

    try {
      // 1) 获取麦克风
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      streamRef.current = stream;

      // 2) 创建 AudioContext（用浏览器默认采样率，再 downsample 到 16k）
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextCtor();
      audioCtxRef.current = audioCtx;

      // 3) 重采样：在 onAudioProcess 里做
      const source = audioCtx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;
      source.connect(analyser);

      const bufferSize = 4096;
      const processor = audioCtx.createScriptProcessor(bufferSize, 1, 1);
      processorRef.current = processor;

      const inputSampleRate = audioCtx.sampleRate;
      const ratio = inputSampleRate / TARGET_SAMPLE_RATE;

      processor.onaudioprocess = (event: AudioProcessingEvent) => {
        if (!asr.isConnected()) return;
        const inBuf = event.inputBuffer.getChannelData(0);
        // 线性重采样到 16k
        const outLen = Math.floor(inBuf.length / ratio);
        const out = new Int16Array(outLen);
        for (let i = 0; i < outLen; i++) {
          const srcIdx = i * ratio;
          const i0 = Math.floor(srcIdx);
          const i1 = Math.min(i0 + 1, inBuf.length - 1);
          const t = srcIdx - i0;
          const s = inBuf[i0] * (1 - t) + inBuf[i1] * t;
          const clamped = Math.max(-1, Math.min(1, s));
          out[i] = clamped < 0 ? Math.round(clamped * 0x8000) : Math.round(clamped * 0x7fff);
        }
        pcmBufferRef.current.push(out);
        asr.sendPcm(out);
      };

      source.connect(processor);
      processor.connect(audioCtx.destination); // 某些浏览器需要连接到 destination

      // 4) 振幅动画
      const updateAmp = () => {
        if (analyserRef.current) {
          setAmplitude(calculateAmplitude(analyserRef.current));
        }
        animFrameRef.current = requestAnimationFrame(updateAmp);
      };
      updateAmp();

      // 5) 注册 ASR 事件 + 连接
      asr.onEvent(handleASREvent);
      await asr.connect({ sampleRate: TARGET_SAMPLE_RATE, devPid: 1537 });

      setRecording(true);
    } catch (err) {
      console.error('[useRealtimeASR] start failed', err);
      setError((err as Error).message || '启动失败');
      cleanup();
    }
  }, [cleanup, handleASREvent]);

  const stop = useCallback(async (): Promise<string> => {
    const asr = getBaiduASR();

    return new Promise<string>((resolve) => {
      // 注册一次性 final 回调
      const onEvent = (e: ASREvent) => {
        if (e.type === 'final') {
          asr.offEvent?.(onEvent);
          asr.end();
          cleanup();
          setRecording(false);
          setAmplitude(0);
          const txt = e.text || '';
          setFinalText(txt);
          resolve(txt);
        } else if (e.type === 'close' || e.type === 'error') {
          asr.offEvent?.(onEvent);
          cleanup();
          setRecording(false);
          setAmplitude(0);
          resolve(finalTextRef.current || partialTextRef.current);
        }
      };
      asr.onEvent(onEvent);

      // 兜底：2.5s 还没出 final 文本，就用 partial 或空
      setTimeout(() => {
        asr.offEvent?.(onEvent);
        asr.end();
        cleanup();
        setRecording(false);
        setAmplitude(0);
        const txt = finalTextRef.current || partialTextRef.current;
        if (!txt) {
          console.warn('[useRealtimeASR] stop timeout, no result');
        }
        resolve(txt);
      }, 2500);
    });
  }, [cleanup]);

  const cancel = useCallback(() => {
    const asr = getBaiduASR();
    asr?.close();
    cleanup();
    setRecording(false);
    setAmplitude(0);
  }, [cleanup]);

  // 用 ref 持有最新值，避免回调闭包问题
  const finalTextRef = useRef('');
  const partialTextRef = useRef('');
  useEffect(() => {
    finalTextRef.current = finalText;
  }, [finalText]);
  useEffect(() => {
    partialTextRef.current = partialText;
  }, [partialText]);

  return {
    recording,
    amplitude,
    partialText,
    finalText,
    error,
    connected,
    start,
    stop,
    cancel,
  };
}
