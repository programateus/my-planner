import type { Style } from "./style";

export type StrokeSample = { x: number; y: number; width: number };

export interface Stroke {
  id: string;
  pageIndex: number;
  points: StrokeSample[];
  style: Style;
}
