import { useTypeface, type SkPicture } from "@shopify/react-native-skia";
import { useMemo, useState } from "react";

import type { PlannerTemplateId } from "@/features/drawing/domain/planner-template";
import { createPlannerPicture } from "@/features/drawing/services/create-planner-picture";

export type PlannerPictures = Record<PlannerTemplateId, SkPicture>;

export function usePlannerPictures(dark: boolean) {
  const [error, setError] = useState<Error | null>(null);
  const typeface = useTypeface(require("@/assets/fonts/Karla.ttf"), setError);
  const pictures = useMemo<PlannerPictures | null>(
    () => typeface ? {
      daily: createPlannerPicture("daily", typeface, dark),
      weekly: createPlannerPicture("weekly", typeface, dark),
      monthly: createPlannerPicture("monthly", typeface, dark),
    } : null,
    [dark, typeface],
  );

  return { pictures, error };
}
