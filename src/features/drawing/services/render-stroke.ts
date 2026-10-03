import { Skia, type SkPaint, type SkPath } from "@shopify/react-native-skia";

import type { Stroke } from "@/features/drawing/domain/entities/stroke";
import {
  appendSmoothedPoint,
  appendStrokeSegment,
} from "@/features/drawing/geometry/stroke-smoothing";
import { createStrokePaint } from "@/features/drawing/services/create-stroke-paint";

export type RenderedStroke = Stroke & { path: SkPath; paint: SkPaint };

export function renderStroke(stroke: Stroke): RenderedStroke {
  const builder = Skia.PathBuilder.Make();
  const first = stroke.points[0];
  if (first) {
    builder.addCircle(first.x, first.y, first.width / 2);
    let geometry = { lastPoint: first, cursor: first };
    for (let index = 1; index < stroke.points.length; index++) {
      geometry = appendSmoothedPoint(builder, geometry, stroke.points[index]);
    }
    appendStrokeSegment(builder, geometry.cursor, geometry.lastPoint);
  }
  return {
    ...stroke,
    path: builder.detach(),
    paint: createStrokePaint(stroke.style),
  };
}
