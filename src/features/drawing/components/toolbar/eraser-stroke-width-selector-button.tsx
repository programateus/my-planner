import { useDrawingSettings } from "@/features/drawing/contexts/drawing-settings-context";
import { ERASER_WIDTHS } from "@/features/drawing/domain/stroke-widths";
import { StrokeWidthSelectorButton } from "@/features/drawing/components/toolbar/stroke-width-selector-button";

export function EraserStrokeWidthSelectorButton() {
  const { eraserWidth, setEraserWidth } = useDrawingSettings();

  return (
    <StrokeWidthSelectorButton
      selectedWidth={eraserWidth}
      onWidthChange={setEraserWidth}
      widths={ERASER_WIDTHS}
      widthLabel="Tamanho da borracha"
      previewPath="M 20 20 H 92"
    />
  );
}
