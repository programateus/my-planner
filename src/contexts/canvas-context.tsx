import { CanvasDocument } from "@/features/drawing/domain/canvas-document";
import { CommandManager } from "@/features/drawing/services/command-manager";
import { SkiaCanvasDocument } from "@/features/drawing/services/skia-canvas-document";
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { useUniwind } from "uniwind";

type CanvasContextValue = {
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  document: CanvasDocument;
  history: CommandManager;
};

const CanvasContext = createContext<CanvasContextValue | null>(null);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const { theme } = useUniwind();
  const [selectedColor, setStrokeColor] = useState<string | null>(null);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const strokeColor =
    selectedColor ?? (theme === "dark" ? "#FAFAFA" : "#0A0A0A");

  const document = useMemo(() => {
    return new SkiaCanvasDocument();
  }, []);

  const history = useMemo(() => {
    return new CommandManager();
  }, []);

  const value = useMemo(
    () => ({
      strokeColor,
      setStrokeColor,
      strokeWidth,
      setStrokeWidth,
      document,
      history,
    }),
    [strokeColor, strokeWidth, document, history],
  );

  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(CanvasContext);

  if (!context) {
    throw new Error("useCanvas deve ser usado dentro de CanvasProvider.");
  }

  return context;
}
