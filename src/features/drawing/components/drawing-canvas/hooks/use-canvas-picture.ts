import { Skia } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";

import type { Stroke } from "../../../domain/entities/stroke";

export function useCanvasPicture(
  strokes: SharedValue<Stroke[]>,
  pendingStrokes: SharedValue<Stroke[]>,
) {
  return useDerivedValue(() => {
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
}
