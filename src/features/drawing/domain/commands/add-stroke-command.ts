import { CanvasDocument } from "../canvas-document";
import { Stroke } from "../entities/stroke";
import { Command } from "./command";

export class AddStrokeCommand implements Command {
  constructor(
    private readonly canvasDocument: CanvasDocument,
    private readonly stroke: Stroke,
  ) {}

  execute(): void {
    this.canvasDocument.addStroke(this.stroke);
  }

  undo(): void {
    this.canvasDocument.removeStroke(this.stroke);
  }
}
