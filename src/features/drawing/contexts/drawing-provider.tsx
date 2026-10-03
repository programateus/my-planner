import type { ReactNode } from "react";

import { DrawingSessionProvider } from "./drawing-session-context";
import { DrawingSettingsProvider } from "./drawing-settings-context";
import { PlannerTemplateProvider } from "./planner-template-context";

export function DrawingProvider({ children }: { children: ReactNode }) {
  return (
    <DrawingSessionProvider>
      <DrawingSettingsProvider>
        <PlannerTemplateProvider>{children}</PlannerTemplateProvider>
      </DrawingSettingsProvider>
    </DrawingSessionProvider>
  );
}
