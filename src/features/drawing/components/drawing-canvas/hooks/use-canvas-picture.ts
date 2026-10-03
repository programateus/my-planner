import { ClipOp, Skia } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";

import type { Stroke } from "../../../domain/entities/stroke";
import { getPageBounds } from "../../../geometry/notebook-geometry";

export function useCanvasPicture(
  strokes: SharedValue<Stroke[]>,
  pendingStrokes: SharedValue<Stroke[]>,
) {
  return useDerivedValue(() => {
    const recorder = Skia.PictureRecorder();
    const canvas = recorder.beginRecording();
    const committedIds = new Set<string>();
    const drawStroke = (stroke: Stroke) => {
      const bounds = getPageBounds(stroke.pageIndex);
      canvas.save();
      canvas.clipRect(
        Skia.XYWHRect(bounds.x, bounds.y, bounds.width, bounds.height),
        ClipOp.Intersect,
        true,
      );
      canvas.drawPath(stroke.path, stroke.paint);
      canvas.restore();
    };

    for (const stroke of strokes.get()) {
      drawStroke(stroke);
      committedIds.add(stroke.id);
    }
    for (const stroke of pendingStrokes.get()) {
      if (!committedIds.has(stroke.id)) {
        drawStroke(stroke);
      }
    }

    return recorder.finishRecordingAsPicture();
  });
}
