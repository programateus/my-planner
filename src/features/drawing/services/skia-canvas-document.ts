import { makeMutable, SharedValue } from "react-native-reanimated";
import { CanvasDocument } from "../domain/canvas-document";
import { Stroke } from "../domain/entities/stroke";
import type { PageTemplates, PlannerTemplateId } from "../domain/planner-template";

export class SkiaCanvasDocument implements CanvasDocument {
  private readonly strokes: SharedValue<Stroke[]>;
  private pageTemplates: PageTemplates = {};
  private readonly templateListeners = new Set<() => void>();

  constructor() {
    this.strokes = makeMutable<Stroke[]>([]);
  }

  addStroke(stroke: Stroke): void {
    this.strokes.modify((previous) => {
      "worklet";
      previous.push(stroke);

      return previous;
    });
  }

  removeStroke(stroke: Stroke): void {
    this.strokes.modify((previous) => {
      "worklet";
      const index = previous.findIndex((value) => value.id === stroke.id);
      if (index !== -1) {
        previous.splice(index, 1);
      }

      return previous;
    });
  }

  getStrokes(): SharedValue<Stroke[]> {
    return this.strokes;
  }

  getPageTemplates(): PageTemplates {
    return this.pageTemplates;
  }

  setPageTemplate(pageIndex: number, template: PlannerTemplateId | null): void {
    if (!Number.isInteger(pageIndex) || pageIndex < 0) return;
    if ((this.pageTemplates[pageIndex] ?? null) === template) return;

    const next = { ...this.pageTemplates };
    if (template === null) {
      delete next[pageIndex];
    } else {
      next[pageIndex] = template;
    }
    this.pageTemplates = next;
    this.templateListeners.forEach((listener) => listener());
  }

  subscribePageTemplates(listener: () => void): () => void {
    this.templateListeners.add(listener);
    return () => { this.templateListeners.delete(listener); };
  }
}
