import type { VlogTheme, BGM } from '@/types';

export const themes: VlogTheme[] = [
  {
    id: 'ink-painting',
    name: '山水画卷',
    description: '水墨淡雅，配以悠扬古琴',
    primaryColor: '#1F3A3D',
    secondaryColor: '#F5F1E8',
    bgmId: 'guqin',
    filter: 'ink',
    textEffect: 'calligraphy',
  },
  {
    id: 'prosperity',
    name: '繁华盛世',
    description: '暖色调，欢快民乐',
    primaryColor: '#C53030',
    secondaryColor: '#D4A574',
    bgmId: 'folk',
    filter: 'vintage',
    textEffect: 'modern',
  },
  {
    id: 'night-bright',
    name: '夜色璀璨',
    description: '深蓝夜色，悠扬古筝',
    primaryColor: '#2C7A7B',
    secondaryColor: '#E8F0F2',
    bgmId: 'guzheng',
    filter: 'night',
    textEffect: 'glow',
  },
];

export const bgmList: BGM[] = [
  {
    id: 'guqin',
    name: '高山流水',
    url: '/assets/bgm/guqin.mp3',
    duration: 180,
    mood: '悠远清雅',
  },
  {
    id: 'folk',
    name: '喜庆民乐',
    url: '/assets/bgm/folk.mp3',
    duration: 165,
    mood: '欢快热闹',
  },
  {
    id: 'guzheng',
    name: '月满西楼',
    url: '/assets/bgm/guzheng.mp3',
    duration: 195,
    mood: '静谧悠远',
  },
  {
    id: 'erhu',
    name: '二泉映月',
    url: '/assets/bgm/erhu.mp3',
    duration: 210,
    mood: '苍凉古朴',
  },
  {
    id: 'pipa',
    name: '琵琶语',
    url: '/assets/bgm/pipa.mp3',
    duration: 175,
    mood: '婉转细腻',
  },
];

// 查找主题
export const findTheme = (id: string): VlogTheme | undefined =>
  themes.find((t) => t.id === id);

// 查找BGM
export const findBgm = (id: string): BGM | undefined =>
  bgmList.find((b) => b.id === id);
