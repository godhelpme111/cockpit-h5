// 通用类型

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}
