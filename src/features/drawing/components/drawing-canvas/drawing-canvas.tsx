import {
  Canvas,
  Group,
  Rect,
  RoundedRect,
  Shadow,
  Skia,
} from "@shopify/react-native-skia";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useDerivedValue } from "react-native-reanimated";
import { useUniwind } from "uniwind";

import { useDrawingSession } from "../../contexts/drawing-session-context";
import { useDrawingSettings } from "../../contexts/drawing-settings-context";
import { getPageBounds } from "../../geometry/notebook-geometry";
import { useDrawingActions } from "../../hooks/use-drawing-actions";
import { ActiveStrokeLayer } from "./active-stroke-layer";
import { CommittedStrokesLayer } from "./committed-strokes-layer";
import { ViewportControls } from "./viewport-controls";
import { usePenGesture } from "./hooks/gestures/use-pen-gesture";
import { useViewportGesture } from "./hooks/gestures/use-viewport-gesture";
import { useStrokeSession } from "./hooks/use-stroke-session";

export function DrawingCanvas() {
  const { theme } = useUniwind();
  const dark = theme === "dark";
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
  const viewport = useViewportGesture(session.currentPage);
  const penGesture = usePenGesture(session, viewport);
  const gesture = useMemo(
    () => Gesture.Simultaneous(viewport.gesture, penGesture),
    [viewport.gesture, penGesture],
  );
  const activePage = session.currentPage;
  const activeClip = useDerivedValue(() => {
    const bounds = getPageBounds(Math.max(0, activePage.get()));
    return Skia.XYWHRect(bounds.x, bounds.y, bounds.width, bounds.height);
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture} touchAction="none">
        <View
          collapsable={false}
          onLayout={viewport.onLayout}
          style={[styles.workspace, { backgroundColor: dark ? "#14161B" : "#E9ECF1" }]}
        >
          <Canvas style={styles.container}>
            <Group transform={viewport.transform}>
              {Array.from({ length: viewport.pageCount }, (_, index) => (
                <Group key={index}>
                  <RoundedRect
                    {...getPageBounds(index)}
                    r={3}
                    color={dark ? "#25272D" : "#FFFFFF"}
                  >
                    <Shadow dx={0} dy={4} blur={10} color={dark ? "#00000070" : "#18243A24"} />
                  </RoundedRect>
                  <Rect
                    {...getPageBounds(index)}
                    style="stroke"
                    strokeWidth={1}
                    color={dark ? "#3D414A" : "#D6DBE3"}
                  />
                </Group>
              ))}
              <Group layer>
                <CommittedStrokesLayer
                  strokes={document.getStrokes()}
                  pendingStrokes={session.pendingStrokes}
                />
                <Group clip={activeClip}>
                  <ActiveStrokeLayer
                    path={session.currentPath}
                    color={session.currentColor}
                    blendMode={session.currentBlendMode}
                  />
                </Group>
              </Group>
            </Group>
          </Canvas>
        </View>
      </GestureDetector>
      <ViewportControls viewport={viewport} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  workspace: { flex: 1, overflow: "hidden" },
});
