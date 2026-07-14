import { create } from 'zustand';

interface SettingsState {
  volume: number;
  brightness: number;
  language: 'zh-CN' | 'en-US';
  setVolume: (v: number) => void;
  setBrightness: (v: number) => void;
  setLanguage: (lang: 'zh-CN' | 'en-US') => void;
}

const STORAGE_KEY = 'settings';

const loadSettings = (): Partial<SettingsState> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const persist = (state: Partial<SettingsState>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
};

export const useSettingsStore = create<SettingsState>((set) => ({
  volume: loadSettings().volume ?? 0.8,
  brightness: loadSettings().brightness ?? 0.9,
  language: loadSettings().language ?? 'zh-CN',
  setVolume: (v) => {
    set({ volume: v });
    persist({ volume: v });
  },
  setBrightness: (v) => {
    set({ brightness: v });
    persist({ brightness: v });
  },
  setLanguage: (lang) => {
    set({ language: lang });
    persist({ language: lang });
  },
}));
