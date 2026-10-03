import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { useUniwind } from "uniwind";

import type { DrawingTool } from "../domain/drawing-tool";
import {
  DEFAULT_ERASER_WIDTH,
  DEFAULT_STROKE_WIDTH,
} from "../domain/stroke-widths";

type DrawingSettingsContextValue = {
  tool: DrawingTool;
  setTool: (tool: DrawingTool) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  eraserWidth: number;
  setEraserWidth: (width: number) => void;
};

const DrawingSettingsContext =
  createContext<DrawingSettingsContextValue | null>(null);

export function DrawingSettingsProvider({ children }: { children: ReactNode }) {
  const { theme } = useUniwind();
  const [tool, setTool] = useState<DrawingTool>("pen");
  const [selectedColor, setStrokeColor] = useState<string | null>(null);
  const [strokeWidth, setStrokeWidth] = useState<number>(DEFAULT_STROKE_WIDTH);
  const [eraserWidth, setEraserWidth] = useState<number>(DEFAULT_ERASER_WIDTH);
  const strokeColor =
    selectedColor ?? (theme === "dark" ? "#FAFAFA" : "#0A0A0A");

  const value = useMemo(
    () => ({
      tool,
      setTool,
      strokeColor,
      setStrokeColor,
      strokeWidth,
      setStrokeWidth,
      eraserWidth,
      setEraserWidth,
    }),
    [tool, strokeColor, strokeWidth, eraserWidth],
  );

  return (
    <DrawingSettingsContext.Provider value={value}>
      {children}
    </DrawingSettingsContext.Provider>
  );
}

export function useDrawingSettings() {
  const context = useContext(DrawingSettingsContext);

  if (!context) {
    throw new Error(
      "useDrawingSettings deve ser usado dentro de DrawingSettingsProvider.",
    );
  }

  return context;
}
