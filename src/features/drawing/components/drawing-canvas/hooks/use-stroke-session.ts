import { Skia, type SkPathBuilder } from "@shopify/react-native-skia";
import { useCallback, useMemo } from "react";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import type { Stroke } from "../../../domain/entities/stroke";
import type { Style } from "../../../domain/entities/style";
import {
  appendSmoothedPoint,
  appendStrokeSegment,
  createStrokeSample,
  type StrokeGeometry,
  type StrokePoint,
} from "../../../geometry/stroke-smoothing";
import { createStrokePaint } from "../../../services/create-stroke-paint";
import { createStrokeId } from "../../../utils/createStrokeId";

type StrokeDraft = {
  builder: SkPathBuilder;
  geometry: StrokeGeometry;
  style: Style;
};

type StrokeSessionOptions = {
  style: Style;
  onCommit: (stroke: Stroke) => void;
};

export function useStrokeSession({ style, onCommit }: StrokeSessionOptions) {
  const { color, width } = style;
  const draft = useSharedValue<StrokeDraft | null>(null);
  const pendingStrokes = useSharedValue<Stroke[]>([]);
  const currentColor = useSharedValue(color);
  const emptyPath = useMemo(() => Skia.PathBuilder.Make().build(), []);

  const currentPath = useDerivedValue(() => {
    const current = draft.get();
    if (!current) return emptyPath;

    const preview = Skia.PathBuilder.MakeFromPath(current.builder.build());
    appendStrokeSegment(
      preview,
      current.geometry.cursor,
      current.geometry.lastPoint,
    );
    return preview.detach();
  });

  const commitStroke = useCallback(
    (stroke: Stroke) => {
      onCommit(stroke);

      const strokeId = stroke.id;
      pendingStrokes.modify((previous) => {
        "worklet";
        return previous.filter((value) => value.id !== strokeId);
      });
    },
    [onCommit, pendingStrokes],
  );

  const beginStroke = useCallback(
    (point: StrokePoint) => {
      "worklet";
      const builder = Skia.PathBuilder.Make();
      const sample = createStrokeSample(point, width);
      builder.addCircle(sample.x, sample.y, sample.width / 2);
      currentColor.set(color);
      draft.set({
        builder,
        geometry: { lastPoint: sample, cursor: sample },
        style: { color, width },
      });
    },
    [color, width, currentColor, draft],
  );

  const updateStroke = useCallback(
    (point: StrokePoint) => {
      "worklet";
      const current = draft.get();
      if (!current) return;

      const geometry = appendSmoothedPoint(
        current.builder,
        current.geometry,
        createStrokeSample(
          point,
          current.style.width,
          current.geometry.lastPoint.width,
        ),
      );
      if (geometry !== current.geometry) {
        draft.set({ ...current, geometry });
      }
    },
    [draft],
  );

  const finishStroke = useCallback(
    (point: StrokePoint) => {
      "worklet";
      const current = draft.get();
      if (!current) return;

      // Pen-up often reports zero pressure; retain the last contact width.
      const geometry = appendSmoothedPoint(
        current.builder,
        current.geometry,
        { x: point.x, y: point.y, width: current.geometry.lastPoint.width },
      );
      appendStrokeSegment(current.builder, geometry.cursor, geometry.lastPoint);
      const stroke: Stroke = {
        id: createStrokeId(),
        path: current.builder.detach(),
        paint: createStrokePaint(current.style),
      };

      pendingStrokes.modify((previous) => {
        "worklet";
        previous.push(stroke);
        return previous;
      });
      draft.set(null);
      scheduleOnRN(commitStroke, stroke);
    },
    [draft, pendingStrokes, commitStroke],
  );

  const cancelStroke = useCallback(() => {
    "worklet";
    draft.set(null);
  }, [draft]);

  return {
    currentPath,
    currentColor,
    pendingStrokes,
    beginStroke,
    updateStroke,
    finishStroke,
    cancelStroke,
  };
}

export type StrokeSession = ReturnType<typeof useStrokeSession>;
