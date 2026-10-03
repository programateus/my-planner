import { useDrawingSettings } from "@/features/drawing/contexts/drawing-settings-context";
import { STROKE_WIDTHS } from "@/features/drawing/domain/stroke-widths";
import { StrokeWidthSelectorButton } from "@/features/drawing/components/toolbar/stroke-width-selector-button";

export function PenStrokeWidthSelectorButton() {
  const { strokeWidth, setStrokeWidth } = useDrawingSettings();

  return (
    <StrokeWidthSelectorButton
      selectedWidth={strokeWidth}
      onWidthChange={setStrokeWidth}
      widths={STROKE_WIDTHS}
      widthLabel="Largura do traço"
      previewPath="M 10 27 C 21 10 30 10 40 23 S 58 31 69 17 S 88 10 102 20"
    />
  );
}
