import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
} from "react";

import type { CanvasDocument } from "../domain/canvas-document";
import { CommandManager } from "../services/command-manager";
import { SkiaCanvasDocument } from "../services/skia-canvas-document";

type DrawingSessionContextValue = {
  document: CanvasDocument;
  history: CommandManager;
};

const DrawingSessionContext =
  createContext<DrawingSessionContextValue | null>(null);

export function DrawingSessionProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      document: new SkiaCanvasDocument(),
      history: new CommandManager(),
    }),
    [],
  );

  return (
    <DrawingSessionContext.Provider value={value}>
      {children}
    </DrawingSessionContext.Provider>
  );
}

export function useDrawingSession() {
  const context = useContext(DrawingSessionContext);

  if (!context) {
    throw new Error(
      "useDrawingSession deve ser usado dentro de DrawingSessionProvider.",
    );
  }

  return context;
}
