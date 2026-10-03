import type { ReactNode } from "react";

import { DrawingSessionProvider } from "./drawing-session-context";
import { DrawingSettingsProvider } from "./drawing-settings-context";

export function DrawingProvider({ children }: { children: ReactNode }) {
  return (
    <DrawingSessionProvider>
      <DrawingSettingsProvider>{children}</DrawingSettingsProvider>
    </DrawingSessionProvider>
  );
}
