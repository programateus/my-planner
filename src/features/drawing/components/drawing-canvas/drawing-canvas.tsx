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

import { useDrawingSession } from "@/features/drawing/contexts/drawing-session-context";
import { useDrawingSettings } from "@/features/drawing/contexts/drawing-settings-context";
import { usePlannerTemplate } from "@/features/drawing/contexts/planner-template-context";
import { getPageBounds } from "@/features/drawing/geometry/notebook-geometry";
import { useDrawingActions } from "@/features/drawing/hooks/use-drawing-actions";
import { ActiveStrokeLayer } from "@/features/drawing/components/drawing-canvas/active-stroke-layer";
import { CommittedStrokesLayer } from "@/features/drawing/components/drawing-canvas/committed-strokes-layer";
import { PageTemplateLayer } from "@/features/drawing/components/drawing-canvas/page-template-layer";
import { ViewportControls } from "@/features/drawing/components/drawing-canvas/viewport-controls";
import { usePenGesture } from "@/features/drawing/components/drawing-canvas/hooks/gestures/use-pen-gesture";
import { useViewportGesture } from "@/features/drawing/components/drawing-canvas/hooks/gestures/use-viewport-gesture";
import { useStrokeSession } from "@/features/drawing/components/drawing-canvas/hooks/use-stroke-session";

export function DrawingCanvas() {
  const { document } = useDrawingSession();
  const { templates, pictures, dark } = usePlannerTemplate();
  const {
    tool,
    strokeColor,
    strokeWidth,
    highlighterColor,
    highlighterWidth,
    eraserWidth,
  } = useDrawingSettings();
  const { addStroke } = useDrawingActions();
  const session = useStrokeSession({
    style: {
      color: tool === "highlighter" ? highlighterColor : strokeColor,
      width:
        tool === "eraser"
          ? eraserWidth
          : tool === "highlighter"
            ? highlighterWidth
            : strokeWidth,
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
          style={[
            styles.workspace,
            { backgroundColor: dark ? "#14161B" : "#E9ECF1" },
          ]}
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
                    <Shadow
                      dx={0}
                      dy={4}
                      blur={10}
                      color={dark ? "#00000070" : "#18243A24"}
                    />
                  </RoundedRect>
                  <Rect
                    {...getPageBounds(index)}
                    style="stroke"
                    strokeWidth={1}
                    color={dark ? "#3D414A" : "#D6DBE3"}
                  />
                </Group>
              ))}
              {pictures &&
                Array.from({ length: viewport.pageCount }, (_, index) => {
                  const template = templates[index];
                  return template ? (
                    <PageTemplateLayer
                      key={index}
                      pageIndex={index}
                      picture={pictures[template]}
                    />
                  ) : null;
                })}
              <Group layer>
                <CommittedStrokesLayer
                  strokes={document.getRenderedStrokes()}
                  pendingStrokes={session.pendingStrokes}
                />
                <Group clip={activeClip}>
                  <ActiveStrokeLayer
                    path={session.currentPath}
                    color={session.currentColor}
                    opacity={session.currentOpacity}
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
