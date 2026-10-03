import { createContext, type ReactNode, useContext, useMemo } from "react";
import { useSharedValue, type SharedValue } from "react-native-reanimated";

import { CommandManager } from "@/features/drawing/services/command-manager";
import { SkiaCanvasDocument } from "@/features/drawing/services/skia-canvas-document";

type DrawingSessionContextValue = {
  document: SkiaCanvasDocument;
  history: CommandManager;
  currentPage: SharedValue<number>;
};

const DrawingSessionContext = createContext<DrawingSessionContextValue | null>(
  null,
);

export function DrawingSessionProvider({
  children,
  document,
}: {
  children: ReactNode;
  document: SkiaCanvasDocument;
}) {
  const currentPage = useSharedValue(0);
  const value = useMemo(
    () => ({
      document,
      history: new CommandManager(),
      currentPage,
    }),
    [currentPage, document],
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
