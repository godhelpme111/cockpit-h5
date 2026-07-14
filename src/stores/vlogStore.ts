import { create } from 'zustand';
import type { VideoClip, VlogProject, ThemeId } from '@/types';
import { findTheme, findBgm } from '@/data/themes';
import { generateId } from '@/utils/format';

interface VlogState {
  // 录制状态
  isRecording: boolean;
  recordedClips: VideoClip[];
  recordDuration: number;
  selectedTheme: ThemeId;
  selectedBgm: string;
  selectedFilter: 'ink' | 'vintage' | 'night' | 'fresh';

  // 项目状态
  currentProject: VlogProject | null;
  composedUrl: string | null;
  isComposing: boolean;
  composeProgress: number;
  composeStage: string;

  // 相册
  projects: VlogProject[];

  // Actions
  startRecording: () => void;
  stopRecording: () => void;
  addClip: (clip: VideoClip) => void;
  removeClip: (id: string) => void;
  reorderClips: (from: number, to: number) => void;
  setTheme: (id: ThemeId) => void;
  setBgm: (id: string) => void;
  setFilter: (f: VlogState['selectedFilter']) => void;
  setComposed: (url: string | null) => void;
  setComposing: (v: boolean) => void;
  setComposeProgress: (progress: number, stage: string) => void;
  saveProject: (project: VlogProject) => void;
  reset: () => void;
}

const initialState = {
  isRecording: false,
  recordedClips: [],
  recordDuration: 0,
  selectedTheme: 'ink-painting' as ThemeId,
  selectedBgm: 'guqin',
  selectedFilter: 'ink' as const,
  currentProject: null,
  composedUrl: null,
  isComposing: false,
  composeProgress: 0,
  composeStage: '',
  projects: JSON.parse(localStorage.getItem('vlog-projects') || '[]'),
};

export const useVlogStore = create<VlogState>((set, get) => ({
  ...initialState,

  startRecording: () => set({ isRecording: true }),
  stopRecording: () => set({ isRecording: false }),

  addClip: (clip) => {
    set((s) => ({
      recordedClips: [...s.recordedClips, clip],
      recordDuration: s.recordDuration + clip.duration,
    }));
  },

  removeClip: (id) => {
    set((s) => {
      const clip = s.recordedClips.find((c) => c.id === id);
      return {
        recordedClips: s.recordedClips.filter((c) => c.id !== id),
        recordDuration: clip ? s.recordDuration - clip.duration : s.recordDuration,
      };
    });
  },

  reorderClips: (from, to) => {
    set((s) => {
      const list = [...s.recordedClips];
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      return { recordedClips: list };
    });
  },

  setTheme: (id) => {
    const theme = findTheme(id);
    set({
      selectedTheme: id,
      selectedBgm: theme?.bgmId || get().selectedBgm,
      selectedFilter: theme?.filter || get().selectedFilter,
    });
  },

  setBgm: (id) => set({ selectedBgm: id }),
  setFilter: (f) => set({ selectedFilter: f }),

  setComposed: (url) => set({ composedUrl: url }),
  setComposing: (v) => set({ isComposing: v }),
  setComposeProgress: (progress, stage) => set({ composeProgress: progress, composeStage: stage }),

  saveProject: (project) => {
    set((s) => {
      const projects = [project, ...s.projects];
      localStorage.setItem('vlog-projects', JSON.stringify(projects));
      return { projects, currentProject: project };
    });
  },

  reset: () =>
    set({
      recordedClips: [],
      recordDuration: 0,
      isRecording: false,
      composedUrl: null,
      isComposing: false,
      composeProgress: 0,
      composeStage: '',
    }),
}));

// 帮助函数：创建Vlog项目
export const createVlogProject = (params: {
  themeId: ThemeId;
  bgmId: string;
  filter: VlogState['selectedFilter'];
  clips: VideoClip[];
  outputUrl: string;
  duration: number;
}): VlogProject => {
  const theme = findTheme(params.themeId);
  return {
    id: generateId(),
    themeId: params.themeId,
    bgmId: params.bgmId,
    filter: params.filter,
    clips: params.clips,
    createdAt: Date.now(),
    duration: params.duration,
    status: 'completed',
    outputUrl: params.outputUrl,
  };
};
