import { useMemo } from "react";

import { useDrawingSession } from "../contexts/drawing-session-context";
import { AddStrokeCommand } from "../domain/commands/add-stroke-command";
import type { Stroke } from "../domain/entities/stroke";

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
