import type { DrawingTool } from "../drawing-tool";

export interface Style {
  width: number;
  color: string;
  tool: DrawingTool;
}
