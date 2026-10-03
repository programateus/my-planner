import { Canvas } from "@shopify/react-native-skia";
import { GestureDetector } from "react-native-gesture-handler";

import { useDrawingSession } from "../../contexts/drawing-session-context";
import { useDrawingSettings } from "../../contexts/drawing-settings-context";
import { useDrawingActions } from "../../hooks/use-drawing-actions";
import { ActiveStrokeLayer } from "./active-stroke-layer";
import { CommittedStrokesLayer } from "./committed-strokes-layer";
import { usePenGesture } from "./hooks/gestures/use-pen-gesture";
import { useStrokeSession } from "./hooks/use-stroke-session";

export function DrawingCanvas() {
  const { document } = useDrawingSession();
  const { strokeColor, strokeWidth } = useDrawingSettings();
  const { addStroke } = useDrawingActions();
  const session = useStrokeSession({
    style: { color: strokeColor, width: strokeWidth },
    onCommit: addStroke,
  });
  const gesture = usePenGesture(session);

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{ flex: 1 }}>
        <CommittedStrokesLayer
          strokes={document.getStrokes()}
          pendingStrokes={session.pendingStrokes}
        />
        <ActiveStrokeLayer
          path={session.currentPath}
          color={session.currentColor}
        />
      </Canvas>
    </GestureDetector>
  );
}
