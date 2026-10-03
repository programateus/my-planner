import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
} from "react";
import { useSharedValue, type SharedValue } from "react-native-reanimated";

import type { CanvasDocument } from "../domain/canvas-document";
import { CommandManager } from "../services/command-manager";
import { SkiaCanvasDocument } from "../services/skia-canvas-document";

type DrawingSessionContextValue = {
  document: CanvasDocument;
  history: CommandManager;
  currentPage: SharedValue<number>;
};

const DrawingSessionContext =
  createContext<DrawingSessionContextValue | null>(null);

export function DrawingSessionProvider({ children }: { children: ReactNode }) {
  const currentPage = useSharedValue(0);
  const value = useMemo(
    () => ({
      document: new SkiaCanvasDocument(),
      history: new CommandManager(),
      currentPage,
    }),
    [currentPage],
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
