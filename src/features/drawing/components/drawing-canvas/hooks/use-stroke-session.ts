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
  pageIndex: number;
  builder: SkPathBuilder;
  geometry: StrokeGeometry;
  style: Style;
};

type StrokeSessionOptions = {
  style: Style;
  onCommit: (stroke: Stroke) => void;
};

export function useStrokeSession({ style, onCommit }: StrokeSessionOptions) {
  const { color, width, tool } = style;
  const draft = useSharedValue<StrokeDraft | null>(null);
  const pendingStrokes = useSharedValue<Stroke[]>([]);
  const currentColor = useSharedValue(color);
  const currentBlendMode = useSharedValue<"clear" | "srcOver">("srcOver");
  const currentPage = useSharedValue(-1);
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
    (point: StrokePoint, pageIndex: number) => {
      "worklet";
      const builder = Skia.PathBuilder.Make();
      const sample = createStrokeSample(
        tool === "eraser" ? { x: point.x, y: point.y } : point,
        width,
      );
      builder.addCircle(sample.x, sample.y, sample.width / 2);
      currentColor.set(color);
      currentBlendMode.set(tool === "eraser" ? "clear" : "srcOver");
      currentPage.set(pageIndex);
      draft.set({
        pageIndex,
        builder,
        geometry: { lastPoint: sample, cursor: sample },
        style: { color, width, tool },
      });
    },
    [color, width, tool, currentColor, currentBlendMode, currentPage, draft],
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
          current.style.tool === "eraser"
            ? { x: point.x, y: point.y }
            : point,
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

      const geometry = appendSmoothedPoint(current.builder, current.geometry, {
        x: point.x,
        y: point.y,
        width: current.geometry.lastPoint.width,
      });
      appendStrokeSegment(current.builder, geometry.cursor, geometry.lastPoint);
      const stroke: Stroke = {
        id: createStrokeId(),
        pageIndex: current.pageIndex,
        path: current.builder.detach(),
        paint: createStrokePaint(current.style),
      };

      pendingStrokes.modify((previous) => {
        "worklet";
        previous.push(stroke);
        return previous;
      });
      draft.set(null);
      currentPage.set(-1);
      scheduleOnRN(commitStroke, stroke);
    },
    [draft, pendingStrokes, commitStroke, currentPage],
  );

  const cancelStroke = useCallback(() => {
    "worklet";
    draft.set(null);
    currentPage.set(-1);
  }, [draft, currentPage]);

  return {
    currentPath,
    currentColor,
    currentBlendMode,
    currentPage,
    pendingStrokes,
    beginStroke,
    updateStroke,
    finishStroke,
    cancelStroke,
  };
}

export type StrokeSession = ReturnType<typeof useStrokeSession>;
