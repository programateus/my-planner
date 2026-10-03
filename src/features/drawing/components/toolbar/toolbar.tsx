import type { ComponentType } from "react";

import { Box } from "@/components/gluestack/box";
import { Divider } from "@/components/gluestack/divider";

import { useDrawingSettings } from "@/features/drawing/contexts/drawing-settings-context";
import type { DrawingTool } from "@/features/drawing/domain/drawing-tool";
import { ColorSelectorButton } from "@/features/drawing/components/toolbar/color-selector-button";
import { EraserButton } from "@/features/drawing/components/toolbar/eraser-button";
import { EraserStrokeWidthSelectorButton } from "@/features/drawing/components/toolbar/eraser-stroke-width-selector-button";
import { HighlighterButton } from "@/features/drawing/components/toolbar/highlighter-button";
import { HighlighterStrokeWidthSelectorButton } from "@/features/drawing/components/toolbar/highlighter-stroke-width-selector-button";
import { PenButton } from "@/features/drawing/components/toolbar/pen-button";
import { PenStrokeWidthSelectorButton } from "@/features/drawing/components/toolbar/pen-stroke-width-selector-button";
import { PageTemplateSelectorButton } from "@/features/drawing/components/toolbar/page-template-selector-button";
import { RedoButton } from "@/features/drawing/components/toolbar/redo-button";
import { UndoButton } from "@/features/drawing/components/toolbar/undo-button";

const STROKE_WIDTH_SELECTORS = {
  pen: PenStrokeWidthSelectorButton,
  highlighter: HighlighterStrokeWidthSelectorButton,
  eraser: EraserStrokeWidthSelectorButton,
} satisfies Record<DrawingTool, ComponentType>;

export const Toolbar = () => {
  const { tool } = useDrawingSettings();
  const StrokeWidthSelector = STROKE_WIDTH_SELECTORS[tool];

  return (
    <Box className="flex-row flex-wrap items-center border-b border-border bg-background px-4 py-3 gap-2">
      <ColorSelectorButton />
      <StrokeWidthSelector />
      <Box className="flex-row items-center gap-2">
        <PenButton />
        <HighlighterButton />
        <EraserButton />
      </Box>
      <Divider orientation="vertical" />
      <UndoButton />
      <RedoButton />
      <Divider orientation="vertical" />
      <PageTemplateSelectorButton />
    </Box>
  );
};
