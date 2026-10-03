import { Stroke } from "@/features/drawing/domain/entities/stroke";
import type {
  PageTemplates,
  PlannerTemplateId,
} from "@/features/drawing/domain/planner-template";

export interface CanvasDocument {
  addStroke(stroke: Stroke): void;
  removeStroke(stroke: Stroke): void;
  getStrokes(): readonly Stroke[];
  getPageCount(): number;
  setPageCount(count: number): void;
  getPageTemplates(): PageTemplates;
  setPageTemplate(pageIndex: number, template: PlannerTemplateId | null): void;
  subscribePageTemplates(listener: () => void): () => void;
}
