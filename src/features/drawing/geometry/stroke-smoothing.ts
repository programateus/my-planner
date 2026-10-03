import type { SkPathBuilder } from "@shopify/react-native-skia";
import type { StrokeSample } from "@/features/drawing/domain/entities/stroke";

export type StrokePoint = { x: number; y: number; pressure?: number };

export type { StrokeSample } from "@/features/drawing/domain/entities/stroke";

export type StrokeGeometry = {
  lastPoint: StrokeSample;
  cursor: StrokeSample;
};

export function getPressureWidth(width: number, pressure?: number): number {
  "worklet";
  const normalized =
    pressure === undefined || !Number.isFinite(pressure) || pressure < 0
      ? 0.5
      : Math.min(1, pressure);
  return width * (0.7 + normalized * 0.6);
}

export function createStrokeSample(
  point: StrokePoint,
  width: number,
  previousWidth?: number,
): StrokeSample {
  "worklet";
  const targetWidth = getPressureWidth(width, point.pressure);
  return {
    x: point.x,
    y: point.y,
    width:
      previousWidth === undefined
        ? targetWidth
        : previousWidth + (targetWidth - previousWidth) * 0.35,
  };
}

export function appendStrokeSegment(
  builder: SkPathBuilder,
  previous: StrokeSample,
  next: StrokeSample,
) {
  "worklet";
  const dx = next.x - previous.x;
  const dy = next.y - previous.y;
  const distance = Math.hypot(dx, dy);
  const nextRadius = next.width / 2;

  if (distance > 0) {
    const nx = -dy / distance;
    const ny = dx / distance;
    const previousRadius = previous.width / 2;
    builder
      .moveTo(
        previous.x + nx * previousRadius,
        previous.y + ny * previousRadius,
      )
      .lineTo(
        previous.x - nx * previousRadius,
        previous.y - ny * previousRadius,
      )
      .lineTo(next.x - nx * nextRadius, next.y - ny * nextRadius)
      .lineTo(next.x + nx * nextRadius, next.y + ny * nextRadius)
      .close();
  }
  builder.addCircle(next.x, next.y, nextRadius);
}

export function appendSmoothedPoint(
  builder: SkPathBuilder,
  geometry: StrokeGeometry,
  next: StrokeSample,
): StrokeGeometry {
  "worklet";
  const { lastPoint: previous, cursor: start } = geometry;
  if (
    previous.x === next.x &&
    previous.y === next.y &&
    previous.width === next.width
  ) {
    return geometry;
  }

  const end = {
    x: (previous.x + next.x) / 2,
    y: (previous.y + next.y) / 2,
    width: (previous.width + next.width) / 2,
  };
  const length =
    Math.hypot(previous.x - start.x, previous.y - start.y) +
    Math.hypot(end.x - previous.x, end.y - previous.y);
  const steps = Math.max(1, Math.ceil(length / 2));
  let cursor = start;

  for (let step = 1; step <= steps; step++) {
    const t = step / steps;
    const inverse = 1 - t;
    const sample = {
      x:
        inverse * inverse * start.x +
        2 * inverse * t * previous.x +
        t * t * end.x,
      y:
        inverse * inverse * start.y +
        2 * inverse * t * previous.y +
        t * t * end.y,
      width:
        inverse * inverse * start.width +
        2 * inverse * t * previous.width +
        t * t * end.width,
    };
    appendStrokeSegment(builder, cursor, sample);
    cursor = sample;
  }

  return { lastPoint: next, cursor: end };
}
