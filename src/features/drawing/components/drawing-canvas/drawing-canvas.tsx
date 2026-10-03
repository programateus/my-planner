import {
  Canvas,
  Path,
  Picture,
  Skia,
  type SkPathBuilder,
} from "@shopify/react-native-skia";
import { useCallback, useMemo } from "react";
import {
  Gesture,
  GestureDetector,
  PointerType,
} from "react-native-gesture-handler";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

import { useCanvas } from "@/contexts/canvas-context";

import { scheduleOnRN } from "react-native-worklets";
import { AddStrokeCommand } from "../../domain/commands/add-stroke-command";
import { Stroke } from "../../domain/entities/stroke";
import { Style } from "../../domain/entities/style";
import {
  appendSmoothedPoint,
  type StrokePoint,
} from "../../geometry/stroke-smoothing";
import { usePaint } from "../../hooks/usePaint";
import { createStrokeId } from "../../utils/createStrokeId";

type StrokeDraft = {
  builder: SkPathBuilder;
  lastPoint: StrokePoint;
  style: Style;
};

export function DrawingCanvas() {
  const { strokeColor, strokeWidth, document, history } = useCanvas();
  const strokes = document.getStrokes();
  const draft = useSharedValue<StrokeDraft | null>(null);
  const pendingStrokes = useSharedValue<Stroke[]>([]);
  const currentColor = useSharedValue(strokeColor);
  const currentWidth = useSharedValue(strokeWidth);
  const emptyPath = useMemo(() => Skia.PathBuilder.Make().build(), []);
  const { makePaint } = usePaint();

  const finishedPicture = useDerivedValue(() => {
    const recorder = Skia.PictureRecorder();
    const canvas = recorder.beginRecording();
    const committedIds = new Set<string>();
    for (const stroke of strokes.get()) {
      canvas.drawPath(stroke.path, stroke.paint);
      committedIds.add(stroke.id);
    }
    for (const stroke of pendingStrokes.get()) {
      if (!committedIds.has(stroke.id)) {
        canvas.drawPath(stroke.path, stroke.paint);
      }
    }
    return recorder.finishRecordingAsPicture();
  });

  const currentPath = useDerivedValue(() => {
    const current = draft.get();
    if (!current) return emptyPath;

    return Skia.PathBuilder.MakeFromPath(current.builder.build())
      .lineTo(current.lastPoint.x, current.lastPoint.y)
      .build();
  });

  const commitStroke = useCallback(
    (stroke: Stroke) => {
      const command = new AddStrokeCommand(document, stroke);
      history.execute(command);

      const strokeId = stroke.id;
      pendingStrokes.modify((previous) => {
        "worklet";
        return previous.filter((value) => value.id !== strokeId);
      });
    },
    [history, document, pendingStrokes],
  );

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onBegin((event) => {
          "worklet";
          if (event.pointerType !== PointerType.STYLUS) return;

          const builder = Skia.PathBuilder.Make();
          builder.moveTo(event.x, event.y).lineTo(event.x, event.y);
          currentColor.set(strokeColor);
          currentWidth.set(strokeWidth);

          draft.set({
            builder,
            lastPoint: { x: event.x, y: event.y },
            style: { width: strokeWidth, color: strokeColor },
          });
        })
        .onUpdate((event) => {
          "worklet";
          const current = draft.get();
          if (event.pointerType !== PointerType.STYLUS || !current) return;

          const lastPoint = appendSmoothedPoint(
            current.builder,
            current.lastPoint,
            { x: event.x, y: event.y },
          );
          if (lastPoint !== current.lastPoint) {
            draft.set({ ...current, lastPoint });
          }
        })
        .onEnd((event, success) => {
          "worklet";
          const current = draft.get();
          if (!success || event.pointerType !== PointerType.STYLUS || !current)
            return;

          const lastPoint = appendSmoothedPoint(
            current.builder,
            current.lastPoint,
            { x: event.x, y: event.y },
          );
          current.builder.lineTo(lastPoint.x, lastPoint.y);
          const stroke: Stroke = {
            id: createStrokeId(),
            path: current.builder.detach(),
            paint: makePaint(current.style),
          };
          pendingStrokes.modify((previous) => {
            "worklet";
            previous.push(stroke);
            return previous;
          });
          draft.set(null);
          scheduleOnRN(commitStroke, stroke);
        })
        .onFinalize(() => {
          "worklet";
          draft.set(null);
        }),
    [
      currentColor,
      strokeColor,
      currentWidth,
      strokeWidth,
      draft,
      pendingStrokes,
      makePaint,
      commitStroke,
    ],
  );

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{ flex: 1 }}>
        <Picture picture={finishedPicture} />
        <Path
          path={currentPath}
          style="stroke"
          strokeWidth={currentWidth}
          strokeCap="round"
          strokeJoin="round"
          color={currentColor}
        />
      </Canvas>
    </GestureDetector>
  );
}
