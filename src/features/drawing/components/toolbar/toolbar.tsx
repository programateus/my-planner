import { Box } from "@/components/gluestack/box";
import { Divider } from "@/components/gluestack/divider";

import { ColorSelectorButton } from "./color-selector-button";
import { EraserButton } from "./eraser-button";
import { RedoButton } from "./redo-button";
import { StrokeWidthSelectorButton } from "./stroke-width-selector-button";
import { UndoButton } from "./undo-button";

export const Toolbar = () => {
  return (
    <Box className="flex-row flex-wrap items-center border-b border-border bg-background px-4 py-3 gap-2">
      <ColorSelectorButton />
      <StrokeWidthSelectorButton />
      <EraserButton />
      <Divider orientation="vertical" />
      <UndoButton />
      <RedoButton />
    </Box>
  );
};
