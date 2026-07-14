import type { VideoClip } from '@/types';

// Vlog素材库（Demo数据，使用文本to_image生成的图片作为封面）
// 实际项目中应使用真实视频文件
export const vlogClips: VideoClip[] = [
  // 前方
  {
    id: 'front-001',
    direction: 'front',
    category: 'landscape',
    duration: 8,
    url: '/assets/vlog-clips/front-001.mp4',
    title: '前方·山峦叠嶂',
    tags: ['山水', '远景'],
  },
  {
    id: 'front-002',
    direction: 'front',
    category: 'architecture',
    duration: 6,
    url: '/assets/vlog-clips/front-002.mp4',
    title: '前方·白塔',
    tags: ['建筑', '白塔'],
  },
  {
    id: 'front-003',
    direction: 'front',
    category: 'landscape',
    duration: 7,
    url: '/assets/vlog-clips/front-003.mp4',
    title: '前方·湖畔小径',
    tags: ['自然', '湖景'],
  },
  {
    id: 'front-004',
    direction: 'front',
    category: 'landscape',
    duration: 5,
    url: '/assets/vlog-clips/front-004.mp4',
    title: '前方·云海日出',
    tags: ['日出', '云海'],
  },
  // 左侧
  {
    id: 'left-001',
    direction: 'left',
    category: 'landscape',
    duration: 6,
    url: '/assets/vlog-clips/left-001.mp4',
    title: '左侧·竹林',
    tags: ['竹林', '清新'],
  },
  {
    id: 'left-002',
    direction: 'left',
    category: 'culture',
    duration: 5,
    url: '/assets/vlog-clips/left-002.mp4',
    title: '左侧·古墙',
    tags: ['古建', '文化'],
  },
  {
    id: 'left-003',
    direction: 'left',
    category: 'landscape',
    duration: 7,
    url: '/assets/vlog-clips/left-003.mp4',
    title: '左侧·溪流',
    tags: ['溪流', '水景'],
  },
  {
    id: 'left-004',
    direction: 'left',
    category: 'animal',
    duration: 4,
    url: '/assets/vlog-clips/left-004.mp4',
    title: '左侧·松鼠',
    tags: ['动物', '可爱'],
  },
  // 右侧
  {
    id: 'right-001',
    direction: 'right',
    category: 'architecture',
    duration: 6,
    url: '/assets/vlog-clips/right-001.mp4',
    title: '右侧·亭台',
    tags: ['建筑', '亭台'],
  },
  {
    id: 'right-002',
    direction: 'right',
    category: 'landscape',
    duration: 7,
    url: '/assets/vlog-clips/right-002.mp4',
    title: '右侧·远山',
    tags: ['远山', '开阔'],
  },
  {
    id: 'right-003',
    direction: 'right',
    category: 'culture',
    duration: 5,
    url: '/assets/vlog-clips/right-003.mp4',
    title: '右侧·石刻',
    tags: ['文化', '石刻'],
  },
  {
    id: 'right-004',
    direction: 'right',
    category: 'landscape',
    duration: 6,
    url: '/assets/vlog-clips/right-004.mp4',
    title: '右侧·花海',
    tags: ['花海', '浪漫'],
  },
  // 后方
  {
    id: 'back-001',
    direction: 'back',
    category: 'landscape',
    duration: 8,
    url: '/assets/vlog-clips/back-001.mp4',
    title: '后方·归途',
    tags: ['归途', '剪影'],
  },
  {
    id: 'back-002',
    direction: 'back',
    category: 'architecture',
    duration: 5,
    url: '/assets/vlog-clips/back-002.mp4',
    title: '后方·古桥',
    tags: ['古桥', '建筑'],
  },
  {
    id: 'back-003',
    direction: 'back',
    category: 'culture',
    duration: 6,
    url: '/assets/vlog-clips/back-003.mp4',
    title: '后方·灯笼街',
    tags: ['灯笼', '热闹'],
  },
  {
    id: 'back-004',
    direction: 'back',
    category: 'night',
    duration: 4,
    url: '/assets/vlog-clips/back-004.mp4',
    title: '后方·夕阳',
    tags: ['夕阳', '黄昏'],
  },
];

// 按方向筛选
export const clipsByDirection = (dir: VideoClip['direction']) =>
  vlogClips.filter((c) => c.direction === dir);

// 随机选取N段
export const randomClips = (n: number, dir?: VideoClip['direction']): VideoClip[] => {
  const pool = dir ? clipsByDirection(dir) : vlogClips;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

// 按方向各取一段
export const getOnePerDirection = (): VideoClip[] =>
  (['front', 'left', 'right', 'back'] as const).map(
    (dir) => vlogClips.filter((c) => c.direction === dir)[0]
  );
