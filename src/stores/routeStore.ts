/**
 * 路线状态管理
 * ────────────
 * 模拟观光车在「杭州·西湖文化线」上的行驶：
 *   武林门 → 凤起路 → 断桥 → 孤山 → 苏堤 → 灵隐 → 循环
 *
 * 状态：
 *   stations            : 6 个站点的元数据
 *   currentIndex        : 当前已到达/正在离开的站 index
 *   progress            : 0..1，当前段（currentIndex → currentIndex+1）的进度
 *   segmentDuration     : 跑完一站所需时间（秒）— 模拟用，默认 25s
 *
 * UI 派生量：
 *   nextStation         : 下一站名
 *   etaSeconds          : 距下一站还剩多少秒（实时递减）
 *   vehicleLeftPercent  : 车辆在路线图上的位置（0..100%）
 */
import { create } from 'zustand';

export interface Station {
  id: string;
  name: string;
  /** 站点的"地标图标" - 用 emoji 简化 */
  icon: string;
  /** 是否起点/终点 */
  type: 'origin' | 'transit' | 'landmark';
}

export const STATIONS: Station[] = [
  { id: 'wulinmen', name: '武林门', icon: '🏯', type: 'origin' },
  { id: 'fengqi', name: '凤起路', icon: '🛣️', type: 'transit' },
  { id: 'duanqiao', name: '断桥', icon: '🌉', type: 'landmark' },
  { id: 'gushan', name: '孤山', icon: '⛰️', type: 'landmark' },
  { id: 'sudi', name: '苏堤', icon: '🌊', type: 'landmark' },
  { id: 'lingyin', name: '灵隐', icon: '🏛️', type: 'landmark' },
];

/** 默认初始：断桥刚出发、即将到达孤山 */
const INITIAL_INDEX = 2;
const INITIAL_PROGRESS = 0.78;
const SEGMENT_SECONDS = 25;

interface RouteState {
  stations: Station[];
  currentIndex: number;
  progress: number;
  segmentDuration: number;
  /** 跨段计数（每跨一段 +1），用于触发 UI 效果 */
  arrivedCount: number;
  setProgress: (p: number) => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  stations: STATIONS,
  currentIndex: INITIAL_INDEX,
  progress: INITIAL_PROGRESS,
  segmentDuration: SEGMENT_SECONDS,
  arrivedCount: 0,
  setProgress: (p) => set({ progress: Math.max(0, Math.min(1, p)) }),
}));

/* ───────────── 派生 helpers（纯函数，组件直接调用） ───────────── */

export function getNextStation(idx: number, stations = STATIONS): Station {
  if (idx + 1 >= stations.length) return stations[0];
  return stations[idx + 1];
}

export function getCurrentStation(idx: number, stations = STATIONS): Station {
  return stations[idx] ?? stations[0];
}

/** 车辆在路线图上的水平位置 0..100% */
export function getVehiclePosition(idx: number, progress: number, total: number): number {
  if (total <= 1) return 0;
  // 把 currentIndex 位置映射到 (idx / (total-1)) * 100，再加上当前段位移
  return ((idx + progress) / (total - 1)) * 100;
}

/** 距下一站剩余秒数 */
export function getEtaSeconds(progress: number, segmentDuration: number): number {
  return Math.max(0, Math.round((1 - progress) * segmentDuration));
}
