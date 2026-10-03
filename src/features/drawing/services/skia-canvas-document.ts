import { makeMutable, SharedValue } from "react-native-reanimated";
import { CanvasDocument } from "@/features/drawing/domain/canvas-document";
import { Stroke } from "@/features/drawing/domain/entities/stroke";
import type {
  PageTemplates,
  PlannerTemplateId,
} from "@/features/drawing/domain/planner-template";
import {
  createEmptyDocument,
  type DocumentData,
} from "@/features/drawing/domain/document-data";
import {
  renderStroke,
  type RenderedStroke,
} from "@/features/drawing/services/render-stroke";

export class SkiaCanvasDocument implements CanvasDocument {
  private readonly renderedStrokes: SharedValue<RenderedStroke[]>;
  private strokes: Stroke[];
  private pageTemplates: PageTemplates;
  private pageCount: number;
  private readonly listeners = new Set<() => void>();
  private readonly templateListeners = new Set<() => void>();

  constructor(data: DocumentData = createEmptyDocument()) {
    this.strokes = [...data.strokes];
    this.pageTemplates = { ...data.pageTemplates };
    this.pageCount = data.pageCount;
    this.renderedStrokes = makeMutable(data.strokes.map(renderStroke));
  }

  addStroke(stroke: Stroke): void {
    this.strokes = [...this.strokes, stroke];
    const rendered = renderStroke(stroke);
    this.renderedStrokes.modify((previous) => {
      "worklet";
      previous.push(rendered);

      return previous;
    });
    this.notify();
  }

  removeStroke(stroke: Stroke): void {
    this.strokes = this.strokes.filter((value) => value.id !== stroke.id);
    const strokeId = stroke.id;
    this.renderedStrokes.modify((previous) => {
      "worklet";
      const index = previous.findIndex((value) => value.id === strokeId);
      if (index !== -1) {
        previous.splice(index, 1);
      }

      return previous;
    });
    this.notify();
  }

  getStrokes(): readonly Stroke[] {
    return this.strokes;
  }

  getRenderedStrokes(): SharedValue<RenderedStroke[]> {
    return this.renderedStrokes;
  }

  getPageCount(): number {
    return this.pageCount;
  }

  setPageCount(count: number): void {
    if (!Number.isInteger(count) || count <= this.pageCount) return;
    this.pageCount = count;
    this.notify();
  }

  snapshot(): DocumentData {
    return {
      version: 1,
      pageCount: this.pageCount,
      strokes: this.strokes,
      pageTemplates: this.pageTemplates,
    };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  getPageTemplates(): PageTemplates {
    return this.pageTemplates;
  }

  setPageTemplate(pageIndex: number, template: PlannerTemplateId | null): void {
    if (
      !Number.isInteger(pageIndex) ||
      pageIndex < 0 ||
      pageIndex >= this.pageCount
    )
      return;
    if ((this.pageTemplates[pageIndex] ?? null) === template) return;

    const next = { ...this.pageTemplates };
    if (template === null) {
      delete next[pageIndex];
    } else {
      next[pageIndex] = template;
    }
    this.pageTemplates = next;
    this.templateListeners.forEach((listener) => listener());
    this.notify();
  }

  subscribePageTemplates(listener: () => void): () => void {
    this.templateListeners.add(listener);
    return () => {
      this.templateListeners.delete(listener);
    };
  }
}
