import { useCallback, useSyncExternalStore } from "react";

import { useDrawingSession } from "../contexts/drawing-session-context";

export function useDrawingHistory() {
  const { history } = useDrawingSession();
  const subscribe = useCallback(
    (listener: () => void) => history.subscribe(listener),
    [history],
  );
  const getSnapshot = useCallback(() => history.snapshot(), [history]);

  useSyncExternalStore(subscribe, getSnapshot);

  return { canUndo: history.canUndo, canRedo: history.canRedo };
}
