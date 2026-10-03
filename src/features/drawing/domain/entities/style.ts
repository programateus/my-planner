import type { DrawingTool } from "@/features/drawing/domain/drawing-tool";

export interface Style {
  width: number;
  color: string;
  tool: DrawingTool;
}
