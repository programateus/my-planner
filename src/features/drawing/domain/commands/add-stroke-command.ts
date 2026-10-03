import { CanvasDocument } from "@/features/drawing/domain/canvas-document";
import { Stroke } from "@/features/drawing/domain/entities/stroke";
import { Command } from "@/features/drawing/domain/commands/command";

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
