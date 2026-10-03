import { createContext, type ReactNode, useContext, useMemo } from "react";
import { useUniwind } from "uniwind";

import { usePageTemplates } from "../hooks/use-page-templates";
import { usePlannerPictures } from "../hooks/use-planner-pictures";

type PlannerTemplateContextValue = ReturnType<typeof usePageTemplates> &
  ReturnType<typeof usePlannerPictures> & { dark: boolean };

const PlannerTemplateContext = createContext<PlannerTemplateContextValue | null>(null);

export function PlannerTemplateProvider({ children }: { children: ReactNode }) {
  const { theme } = useUniwind();
  const dark = theme === "dark";
  const { templates, applyTemplate } = usePageTemplates();
  const { pictures, error } = usePlannerPictures(dark);
  const value = useMemo(
    () => ({ templates, applyTemplate, pictures, error, dark }),
    [templates, applyTemplate, pictures, error, dark],
  );

  return (
    <PlannerTemplateContext.Provider value={value}>
      {children}
    </PlannerTemplateContext.Provider>
  );
}

export function usePlannerTemplate() {
  const context = useContext(PlannerTemplateContext);

  if (!context) {
    throw new Error("usePlannerTemplate deve ser usado dentro de PlannerTemplateProvider.");
  }

  return context;
}
