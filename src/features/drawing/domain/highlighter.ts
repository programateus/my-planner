export const HIGHLIGHTER_COLORS = [
  { label: "Amarelo", value: "#FFF500" },
  { label: "Verde", value: "#7CFF00" },
  { label: "Rosa", value: "#FF5CBB" },
  { label: "Laranja", value: "#FF9F1C" },
  { label: "Azul", value: "#40CFFF" },
  { label: "Roxo", value: "#B88AFF" },
] as const;

export const DEFAULT_HIGHLIGHTER_COLOR = HIGHLIGHTER_COLORS[0].value;
export const HIGHLIGHTER_OPACITY = 0.35;
