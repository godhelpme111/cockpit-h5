import type { IDigitalHuman } from './IDigitalHuman';
import { MockDigitalHuman } from './MockDigitalHuman';
import { BaiduDigitalHuman } from './BaiduDigitalHuman';

const mode = import.meta.env.VITE_BAIDU_SDK_MODE ?? 'mock';

function createService(): IDigitalHuman {
  if (mode === 'real') {
    console.log('[DigitalHuman] 使用真实百度数字人SDK');
    return new BaiduDigitalHuman();
  }
  console.log('[DigitalHuman] 使用Mock数字人');
  return new MockDigitalHuman();
}

export const digitalHumanService: IDigitalHuman = createService();

export type { IDigitalHuman };
