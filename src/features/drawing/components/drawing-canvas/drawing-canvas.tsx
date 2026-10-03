import { Canvas, Group } from "@shopify/react-native-skia";
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
  const { tool, strokeColor, strokeWidth, eraserWidth } = useDrawingSettings();
  const { addStroke } = useDrawingActions();
  const session = useStrokeSession({
    style: {
      color: strokeColor,
      width: tool === "eraser" ? eraserWidth : strokeWidth,
      tool,
    },
    onCommit: addStroke,
  });
  const gesture = usePenGesture(session);

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{ flex: 1 }}>
        <Group layer>
          <CommittedStrokesLayer
            strokes={document.getStrokes()}
            pendingStrokes={session.pendingStrokes}
          />
          <ActiveStrokeLayer
            path={session.currentPath}
            color={session.currentColor}
            blendMode={session.currentBlendMode}
          />
        </Group>
      </Canvas>
    </GestureDetector>
  );
}
