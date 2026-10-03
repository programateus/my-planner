import { Skia, type SkPathBuilder } from "@shopify/react-native-skia";
import { useCallback, useMemo } from "react";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import type { Stroke, StrokeSample } from "../../../domain/entities/stroke";
import type { Style } from "../../../domain/entities/style";
import { HIGHLIGHTER_OPACITY } from "../../../domain/highlighter";
import {
  appendSmoothedPoint,
  appendStrokeSegment,
  createStrokeSample,
  type StrokeGeometry,
  type StrokePoint,
} from "../../../geometry/stroke-smoothing";
import { createStrokePaint } from "../../../services/create-stroke-paint";
import type { RenderedStroke } from "../../../services/render-stroke";
import { createStrokeId } from "../../../utils/createStrokeId";

type StrokeDraft = {
  pageIndex: number;
  builder: SkPathBuilder;
  geometry: StrokeGeometry;
  style: Style;
  points: StrokeSample[];
};

type StrokeSessionOptions = {
  style: Style;
  onCommit: (stroke: Stroke) => void;
};

export function useStrokeSession({ style, onCommit }: StrokeSessionOptions) {
  const { color, width, tool } = style;
  const draft = useSharedValue<StrokeDraft | null>(null);
  const pendingStrokes = useSharedValue<RenderedStroke[]>([]);
  const currentColor = useSharedValue(color);
  const currentOpacity = useSharedValue(1);
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
    (stroke: RenderedStroke) => {
      onCommit({ id: stroke.id, pageIndex: stroke.pageIndex, points: stroke.points, style: stroke.style });

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
        tool === "pen" ? point : { x: point.x, y: point.y },
        width,
      );
      builder.addCircle(sample.x, sample.y, sample.width / 2);
      currentColor.set(color);
      currentOpacity.set(tool === "highlighter" ? HIGHLIGHTER_OPACITY : 1);
      currentBlendMode.set(tool === "eraser" ? "clear" : "srcOver");
      currentPage.set(pageIndex);
      draft.set({
        pageIndex,
        builder,
        geometry: { lastPoint: sample, cursor: sample },
        style: { color, width, tool },
        points: [sample],
      });
    },
    [color, width, tool, currentColor, currentOpacity, currentBlendMode, currentPage, draft],
  );

  const updateStroke = useCallback(
    (point: StrokePoint) => {
      "worklet";
      const current = draft.get();
      if (!current) return;

      const sample = createStrokeSample(
        current.style.tool === "pen" ? point : { x: point.x, y: point.y },
        current.style.width,
        current.geometry.lastPoint.width,
      );
      const geometry = appendSmoothedPoint(
        current.builder,
        current.geometry,
        sample,
      );
      if (geometry !== current.geometry) {
        current.points.push(sample);
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

      const sample = {
        x: point.x,
        y: point.y,
        width: current.geometry.lastPoint.width,
      };
      const geometry = appendSmoothedPoint(current.builder, current.geometry, sample);
      if (geometry !== current.geometry) current.points.push(sample);
      appendStrokeSegment(current.builder, geometry.cursor, geometry.lastPoint);
      const stroke: RenderedStroke = {
        id: createStrokeId(),
        pageIndex: current.pageIndex,
        path: current.builder.detach(),
        paint: createStrokePaint(current.style),
        points: current.points,
        style: current.style,
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
    currentOpacity,
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
