/**
 * 实时流式 ASR 的工厂：单例懒加载
 * 总是返回实例（class 内部根据 env 决定是否能真正连接），避免被 Vite tree-shake 掉。
 */
import { BaiduRealtimeASR, type BaiduRealtimeASRConfig, type ASRDevPid } from './BaiduRealtimeASR';

let instance: BaiduRealtimeASR | null = null;

export function isBaiduASREnabled(): boolean {
  return Boolean(import.meta.env.VITE_BAIDU_ASR_API_KEY) && Boolean(import.meta.env.VITE_BAIDU_ASR_SECRET_KEY);
}

export function getBaiduASR(overrides?: Partial<BaiduRealtimeASRConfig>): BaiduRealtimeASR {
  if (instance) return instance;
  const apiKey = overrides?.apiKey || (import.meta.env.VITE_BAIDU_ASR_API_KEY as string) || '';
  const secretKey = overrides?.secretKey || (import.meta.env.VITE_BAIDU_ASR_SECRET_KEY as string) || '';
  const devPid = (overrides?.devPid ?? (Number(import.meta.env.VITE_BAIDU_ASR_DEV_PID) || 1537)) as ASRDevPid;
  instance = new BaiduRealtimeASR({ apiKey, secretKey, devPid });
  return instance;
}

export type { BaiduRealtimeASR, BaiduRealtimeASRConfig, ASRDevPid } from './BaiduRealtimeASR';
export type { ASREvent } from './BaiduRealtimeASR';
