import { useDrawingSettings } from "@/features/drawing/contexts/drawing-settings-context";
import { HIGHLIGHTER_OPACITY } from "@/features/drawing/domain/highlighter";
import { HIGHLIGHTER_WIDTHS } from "@/features/drawing/domain/stroke-widths";
import { StrokeWidthSelectorButton } from "@/features/drawing/components/toolbar/stroke-width-selector-button";

export function HighlighterStrokeWidthSelectorButton() {
  const { highlighterWidth, setHighlighterWidth, highlighterColor } =
    useDrawingSettings();

  return (
    <StrokeWidthSelectorButton
      selectedWidth={highlighterWidth}
      onWidthChange={setHighlighterWidth}
      widths={HIGHLIGHTER_WIDTHS}
      widthLabel="Largura do marca-texto"
      previewPath="M 20 20 H 92"
      previewColor={highlighterColor}
      previewOpacity={HIGHLIGHTER_OPACITY}
    />
  );
}
