import { PaintStyle, Skia } from "@shopify/react-native-skia";

import type { Style } from "../domain/entities/style";

export function createStrokePaint(style: Style) {
  "worklet";
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  // The filled outline stores the pressure-dependent width along the stroke.
  paint.setStyle(PaintStyle.Fill);
  paint.setColor(Skia.Color(style.color));
  return paint;
}
