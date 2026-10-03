import type { ReactNode } from "react";

import { DrawingSessionProvider } from "./drawing-session-context";
import { DrawingSettingsProvider } from "./drawing-settings-context";
import { PlannerTemplateProvider } from "./planner-template-context";
import type { SkiaCanvasDocument } from "../services/skia-canvas-document";

export function DrawingProvider({ children, document }: { children: ReactNode; document: SkiaCanvasDocument }) {
  return (
    <DrawingSessionProvider document={document}>
      <DrawingSettingsProvider>
        <PlannerTemplateProvider>{children}</PlannerTemplateProvider>
      </DrawingSettingsProvider>
    </DrawingSessionProvider>
  );
}
