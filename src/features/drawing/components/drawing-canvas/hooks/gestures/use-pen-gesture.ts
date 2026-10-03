import { useMemo } from "react";
import { Gesture, PointerType } from "react-native-gesture-handler";

import type { StrokeSession } from "../use-stroke-session";

type PenGestureOptions = Pick<
  StrokeSession,
  "beginStroke" | "updateStroke" | "finishStroke" | "cancelStroke"
>;

export function usePenGesture({
  beginStroke,
  updateStroke,
  finishStroke,
  cancelStroke,
}: PenGestureOptions) {
  return useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onBegin((event) => {
          "worklet";
          if (event.pointerType === PointerType.STYLUS) {
            beginStroke({
              x: event.x,
              y: event.y,
              pressure: event.stylusData?.pressure,
            });
          }
        })
        .onUpdate((event) => {
          "worklet";
          if (event.pointerType === PointerType.STYLUS) {
            updateStroke({
              x: event.x,
              y: event.y,
              pressure: event.stylusData?.pressure,
            });
          }
        })
        .onEnd((event, success) => {
          "worklet";
          if (success && event.pointerType === PointerType.STYLUS) {
            finishStroke({ x: event.x, y: event.y });
          }
        })
        .onFinalize(() => {
          "worklet";
          cancelStroke();
        }),
    [beginStroke, updateStroke, finishStroke, cancelStroke],
  );
}
