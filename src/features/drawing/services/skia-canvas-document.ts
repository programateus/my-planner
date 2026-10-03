import { makeMutable, SharedValue } from "react-native-reanimated";
import { CanvasDocument } from "../domain/canvas-document";
import { Stroke } from "../domain/entities/stroke";

export class SkiaCanvasDocument implements CanvasDocument {
  private readonly strokes: SharedValue<Stroke[]>;

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
}
