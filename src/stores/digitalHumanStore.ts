import { create } from 'zustand';
import type { DHState } from '@/types';
import { digitalHumanService } from '@/services/digitalHuman';

interface DigitalHumanState {
  state: DHState;
  amplitude: number;
  currentText: string;        // 当前正在播报的文本
  setState: (state: DHState) => void;
  setAmplitude: (v: number) => void;
  setCurrentText: (text: string) => void;
  init: () => Promise<void>;
}

export const useDigitalHumanStore = create<DigitalHumanState>((set) => ({
  state: 'idle',
  amplitude: 0,
  currentText: '',

  setState: (state) => {
    digitalHumanService.setState(state);
    set({ state });
  },
  setAmplitude: (v) => set({ amplitude: v }),
  setCurrentText: (text) => set({ currentText: text }),

  init: async () => {
    await digitalHumanService.init({
      avatarId: 'xiaoya',
      voiceId: 'female-zh',
      language: 'zh-CN',
      lipSync: true,
    });
  },
}));
