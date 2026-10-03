import {
  PaintStyle,
  Skia,
  StrokeCap,
  StrokeJoin,
} from "@shopify/react-native-skia";

import type { Style } from "../domain/entities/style";

export function createStrokePaint(style: Style) {
  "worklet";
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setStyle(PaintStyle.Stroke);
  paint.setStrokeCap(StrokeCap.Round);
  paint.setStrokeJoin(StrokeJoin.Round);
  paint.setStrokeWidth(style.width);
  paint.setColor(Skia.Color(style.color));
  return paint;
}
