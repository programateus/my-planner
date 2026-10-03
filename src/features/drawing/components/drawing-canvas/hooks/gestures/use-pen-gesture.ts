import { useMemo } from "react";
import { Gesture, PointerType } from "react-native-gesture-handler";

import {
  clampPointToPage,
  getPageAtPoint,
  toDocumentPoint,
} from "@/features/drawing/geometry/notebook-geometry";
import type { StrokeSession } from "@/features/drawing/components/drawing-canvas/hooks/use-stroke-session";
import type { CanvasViewport } from "@/features/drawing/components/drawing-canvas/hooks/gestures/use-viewport-gesture";

export function usePenGesture(
  {
    beginStroke,
    updateStroke,
    finishStroke,
    cancelStroke,
    currentPage,
  }: StrokeSession,
  { scale, translateX, translateY, pages, stopAnimation }: CanvasViewport,
) {
  return useMemo(() => {
    const toPoint = (event: { x: number; y: number }) => {
      "worklet";
      return toDocumentPoint(
        event,
        { x: translateX.get(), y: translateY.get() },
        scale.get(),
      );
    };
    return Gesture.Pan()
      .minDistance(0)
      .maxPointers(1)
      .onBegin((event) => {
        if (event.pointerType !== PointerType.STYLUS) return;
        stopAnimation();
        const point = toPoint(event);
        const pageIndex = getPageAtPoint(point, pages.get());
        if (pageIndex !== -1)
          beginStroke(
            { ...point, pressure: event.stylusData?.pressure },
            pageIndex,
          );
      })
      .onUpdate((event) => {
        if (
          event.pointerType !== PointerType.STYLUS ||
          currentPage.get() === -1
        )
          return;
        const point = clampPointToPage(toPoint(event), currentPage.get());
        updateStroke({ ...point, pressure: event.stylusData?.pressure });
      })
      .onEnd((event, success) => {
        if (
          success &&
          event.pointerType === PointerType.STYLUS &&
          currentPage.get() !== -1
        ) {
          finishStroke(clampPointToPage(toPoint(event), currentPage.get()));
        }
      })
      .onFinalize(() => {
        cancelStroke();
      });
  }, [
    beginStroke,
    updateStroke,
    finishStroke,
    cancelStroke,
    currentPage,
    scale,
    translateX,
    translateY,
    pages,
    stopAnimation,
  ]);
}
