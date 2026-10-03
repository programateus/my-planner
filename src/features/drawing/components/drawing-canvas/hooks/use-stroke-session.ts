import { Skia, type SkPathBuilder } from "@shopify/react-native-skia";
import { useCallback, useMemo } from "react";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import type { Stroke } from "../../../domain/entities/stroke";
import type { Style } from "../../../domain/entities/style";
import {
  appendSmoothedPoint,
  type StrokePoint,
} from "../../../geometry/stroke-smoothing";
import { createStrokePaint } from "../../../services/create-stroke-paint";
import { createStrokeId } from "../../../utils/createStrokeId";

type StrokeDraft = {
  builder: SkPathBuilder;
  lastPoint: StrokePoint;
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
  const currentWidth = useSharedValue(width);
  const emptyPath = useMemo(() => Skia.PathBuilder.Make().build(), []);

  const currentPath = useDerivedValue(() => {
    const current = draft.get();
    if (!current) return emptyPath;

    return Skia.PathBuilder.MakeFromPath(current.builder.build())
      .lineTo(current.lastPoint.x, current.lastPoint.y)
      .build();
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
      builder.moveTo(point.x, point.y).lineTo(point.x, point.y);
      currentColor.set(color);
      currentWidth.set(width);
      draft.set({ builder, lastPoint: point, style: { color, width } });
    },
    [color, width, currentColor, currentWidth, draft],
  );

  const updateStroke = useCallback(
    (point: StrokePoint) => {
      "worklet";
      const current = draft.get();
      if (!current) return;

      const lastPoint = appendSmoothedPoint(
        current.builder,
        current.lastPoint,
        point,
      );
      if (lastPoint !== current.lastPoint) {
        draft.set({ ...current, lastPoint });
      }
    },
    [draft],
  );

  const finishStroke = useCallback(
    (point: StrokePoint) => {
      "worklet";
      const current = draft.get();
      if (!current) return;

      const lastPoint = appendSmoothedPoint(
        current.builder,
        current.lastPoint,
        point,
      );
      current.builder.lineTo(lastPoint.x, lastPoint.y);
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
    currentWidth,
    pendingStrokes,
    beginStroke,
    updateStroke,
    finishStroke,
    cancelStroke,
  };
}

export type StrokeSession = ReturnType<typeof useStrokeSession>;
