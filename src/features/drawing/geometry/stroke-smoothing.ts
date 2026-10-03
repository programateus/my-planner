import type { SkPathBuilder } from "@shopify/react-native-skia";

export type StrokePoint = { x: number; y: number };

export function appendSmoothedPoint(
  builder: SkPathBuilder,
  previous: StrokePoint,
  next: StrokePoint,
): StrokePoint {
  "worklet";
  if (previous.x === next.x && previous.y === next.y) return previous;

  builder.quadTo(
    previous.x,
    previous.y,
    (previous.x + next.x) / 2,
    (previous.y + next.y) / 2,
  );
  return next;
}
