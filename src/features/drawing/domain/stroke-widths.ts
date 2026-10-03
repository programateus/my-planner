export const STROKE_WIDTHS = [
  { label: "Muito fino", value: 1 },
  { label: "Fino", value: 2 },
  { label: "Médio", value: 4 },
  { label: "Grosso", value: 6 },
  { label: "Muito grosso", value: 8 },
] as const;

export const DEFAULT_STROKE_WIDTH = STROKE_WIDTHS[1].value;

export const HIGHLIGHTER_WIDTHS = [
  { label: "Fino", value: 12 },
  { label: "Médio", value: 20 },
  { label: "Grosso", value: 28 },
  { label: "Muito grosso", value: 36 },
] as const;

export const DEFAULT_HIGHLIGHTER_WIDTH = HIGHLIGHTER_WIDTHS[1].value;

export const ERASER_WIDTHS = [
  { label: "Pequena", value: 8 },
  { label: "Média", value: 16 },
  { label: "Grande", value: 24 },
  { label: "Muito grande", value: 32 },
] as const;

export const DEFAULT_ERASER_WIDTH = ERASER_WIDTHS[1].value;
