import { useMemo } from "react";

import { useDrawingSession } from "@/features/drawing/contexts/drawing-session-context";
import { AddStrokeCommand } from "@/features/drawing/domain/commands/add-stroke-command";
import type { Stroke } from "@/features/drawing/domain/entities/stroke";

export function useDrawingActions() {
  const { document, history } = useDrawingSession();

  return useMemo(
    () => ({
      addStroke: (stroke: Stroke) => {
        history.execute(new AddStrokeCommand(document, stroke));
      },
      undo: () => history.undo(),
      redo: () => history.redo(),
    }),
    [document, history],
  );
}
