import { useCallback, useSyncExternalStore } from "react";

import { useDrawingSession } from "@/features/drawing/contexts/drawing-session-context";
import { SetPageTemplateCommand } from "@/features/drawing/domain/commands/set-page-template-command";
import type { PlannerTemplateId } from "@/features/drawing/domain/planner-template";

export function usePageTemplates() {
  const { document, history } = useDrawingSession();
  const subscribe = useCallback(
    (listener: () => void) => document.subscribePageTemplates(listener),
    [document],
  );
  const getSnapshot = useCallback(() => document.getPageTemplates(), [document]);
  const templates = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const applyTemplate = useCallback(
    (pageIndex: number, template: PlannerTemplateId | null) => {
      if ((document.getPageTemplates()[pageIndex] ?? null) === template) return;
      history.execute(new SetPageTemplateCommand(document, pageIndex, template));
    },
    [document, history],
  );

  return { templates, applyTemplate };
}
