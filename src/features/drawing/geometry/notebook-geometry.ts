export const PAGE_WIDTH = 720;
export const PAGE_HEIGHT = 1018;
export const PAGE_GAP = 32;
export const PAGE_STRIDE = PAGE_HEIGHT + PAGE_GAP;
export const VIEWPORT_PADDING = 24;
export const NEW_PAGE_THRESHOLD = 100;
export const MAX_OVERSCROLL = 160;

export type Point = { x: number; y: number };
export type ViewportSize = { width: number; height: number };

export function clamp(value: number, minimum: number, maximum: number) {
  "worklet";
  return Math.min(maximum, Math.max(minimum, value));
}

export function getFitScale(width: number) {
  "worklet";
  return Math.min(1, Math.max(1, width - VIEWPORT_PADDING * 2) / PAGE_WIDTH);
}

export function getPageBounds(pageIndex: number) {
  "worklet";
  return {
    x: 0,
    y: pageIndex * PAGE_STRIDE,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  };
}

export function getPageAtPoint(point: Point, pageCount: number) {
  "worklet";
  const index = Math.floor(point.y / PAGE_STRIDE);
  if (
    point.x < 0 ||
    point.x > PAGE_WIDTH ||
    point.y < 0 ||
    index >= pageCount ||
    point.y - index * PAGE_STRIDE > PAGE_HEIGHT
  )
    return -1;
  return index;
}

export function toDocumentPoint(point: Point, offset: Point, scale: number) {
  "worklet";
  return { x: (point.x - offset.x) / scale, y: (point.y - offset.y) / scale };
}

export function clampPointToPage(point: Point, pageIndex: number) {
  "worklet";
  const bounds = getPageBounds(pageIndex);
  return {
    x: clamp(point.x, 0, PAGE_WIDTH),
    y: clamp(point.y, bounds.y, bounds.y + PAGE_HEIGHT),
  };
}

export function getTopLimit(height: number, scale: number) {
  "worklet";
  return Math.max(VIEWPORT_PADDING, (height - PAGE_HEIGHT * scale) / 2);
}

export function getBottomLimit(
  height: number,
  scale: number,
  pageCount: number,
) {
  "worklet";
  const documentHeight = pageCount * PAGE_STRIDE - PAGE_GAP;
  const top = getTopLimit(height, scale);
  return Math.min(top, height - top - documentHeight * scale);
}

export function getCenteredPageOffset(
  pageIndex: number,
  size: ViewportSize,
  scale: number,
) {
  "worklet";
  return {
    x: (size.width - PAGE_WIDTH * scale) / 2,
    y: size.height / 2 - (pageIndex * PAGE_STRIDE + PAGE_HEIGHT / 2) * scale,
  };
}

export function constrainOffset(
  offset: Point,
  size: ViewportSize,
  scale: number,
  pageCount: number,
) {
  "worklet";
  const scaledWidth = PAGE_WIDTH * scale;
  return {
    x:
      scaledWidth <= size.width - VIEWPORT_PADDING * 2
        ? (size.width - scaledWidth) / 2
        : clamp(
            offset.x,
            size.width - VIEWPORT_PADDING - scaledWidth,
            VIEWPORT_PADDING,
          ),
    y: clamp(
      offset.y,
      getBottomLimit(size.height, scale, pageCount),
      getTopLimit(size.height, scale),
    ),
  };
}

export function shouldAppendPage(
  offsetY: number,
  bottomLimit: number,
  dragY: number,
) {
  "worklet";
  return (
    bottomLimit - offsetY >= NEW_PAGE_THRESHOLD && dragY <= -NEW_PAGE_THRESHOLD
  );
}
