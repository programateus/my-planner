import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { useUniwind } from "uniwind";

import { DEFAULT_STROKE_WIDTH } from "../domain/stroke-widths";

type DrawingSettingsContextValue = {
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
};

const DrawingSettingsContext =
  createContext<DrawingSettingsContextValue | null>(null);

export function DrawingSettingsProvider({ children }: { children: ReactNode }) {
  const { theme } = useUniwind();
  const [selectedColor, setStrokeColor] = useState<string | null>(null);
  const [strokeWidth, setStrokeWidth] = useState<number>(DEFAULT_STROKE_WIDTH);
  const strokeColor =
    selectedColor ?? (theme === "dark" ? "#FAFAFA" : "#0A0A0A");

  const value = useMemo(
    () => ({ strokeColor, setStrokeColor, strokeWidth, setStrokeWidth }),
    [strokeColor, strokeWidth],
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
