import type { ComponentType } from "react";

import { Box } from "@/components/gluestack/box";
import { Divider } from "@/components/gluestack/divider";

import { useDrawingSettings } from "../../contexts/drawing-settings-context";
import type { DrawingTool } from "../../domain/drawing-tool";
import { ColorSelectorButton } from "./color-selector-button";
import { EraserButton } from "./eraser-button";
import { EraserStrokeWidthSelectorButton } from "./eraser-stroke-width-selector-button";
import { HighlighterButton } from "./highlighter-button";
import { HighlighterStrokeWidthSelectorButton } from "./highlighter-stroke-width-selector-button";
import { PenButton } from "./pen-button";
import { PenStrokeWidthSelectorButton } from "./pen-stroke-width-selector-button";
import { PageTemplateSelectorButton } from "./page-template-selector-button";
import { RedoButton } from "./redo-button";
import { UndoButton } from "./undo-button";

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
