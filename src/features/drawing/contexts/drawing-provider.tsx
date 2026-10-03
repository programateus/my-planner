import type { ReactNode } from "react";

import { DrawingSessionProvider } from "@/features/drawing/contexts/drawing-session-context";
import { DrawingSettingsProvider } from "@/features/drawing/contexts/drawing-settings-context";
import { PlannerTemplateProvider } from "@/features/drawing/contexts/planner-template-context";
import type { SkiaCanvasDocument } from "@/features/drawing/services/skia-canvas-document";

export function DrawingProvider({
  children,
  document,
}: {
  children: ReactNode;
  document: SkiaCanvasDocument;
}) {
  return (
    <DrawingSessionProvider document={document}>
      <DrawingSettingsProvider>
        <PlannerTemplateProvider>{children}</PlannerTemplateProvider>
      </DrawingSettingsProvider>
    </DrawingSessionProvider>
  );
}
