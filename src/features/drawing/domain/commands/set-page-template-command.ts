import type { CanvasDocument } from "../canvas-document";
import type { PlannerTemplateId } from "../planner-template";
import type { Command } from "./command";

export class SetPageTemplateCommand implements Command {
  private readonly previousTemplate: PlannerTemplateId | null;

  constructor(
    private readonly document: CanvasDocument,
    private readonly pageIndex: number,
    private readonly template: PlannerTemplateId | null,
  ) {
    this.previousTemplate = document.getPageTemplates()[pageIndex] ?? null;
  }

  execute() {
    this.document.setPageTemplate(this.pageIndex, this.template);
  }

  undo() {
    this.document.setPageTemplate(this.pageIndex, this.previousTemplate);
  }
}
