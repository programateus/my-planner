import {
  PaintStyle,
  Skia,
  StrokeCap,
  StrokeJoin,
} from "@shopify/react-native-skia";
import { Style } from "../domain/entities/style";

export const usePaint = () => {
  const makePaint = (style: Style) => {
    const paint = Skia.Paint();
    paint.setAntiAlias(true);
    paint.setStyle(PaintStyle.Stroke);
    paint.setStrokeCap(StrokeCap.Round);
    paint.setStrokeJoin(StrokeJoin.Round);
    paint.setStrokeWidth(style.width);
    paint.setColor(Skia.Color(style.color));
    return paint;
  };

  return { makePaint };
};
