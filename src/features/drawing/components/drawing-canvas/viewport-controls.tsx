import { Scan } from "lucide-react-native";
import { useState } from "react";
import { useAnimatedReaction } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { Box } from "@/components/gluestack/box";
import { Button, ButtonIcon } from "@/components/gluestack/button";
import { Text } from "@/components/gluestack/text";

import { getFitScale } from "../../geometry/notebook-geometry";
import type { CanvasViewport } from "./hooks/gestures/use-viewport-gesture";

export function ViewportControls({ viewport }: { viewport: CanvasViewport }) {
  const [zoomPercent, setZoomPercent] = useState(100);
  const { scale, size, centerCurrentPage } = viewport;

  useAnimatedReaction(
    () => size.get().width
      ? Math.round(scale.get() / getFitScale(size.get().width) * 100)
      : 100,
    (next, previous) => {
      if (next !== previous) scheduleOnRN(setZoomPercent, next);
    },
  );

  return (
    <Box className="absolute right-3 top-3 flex-row items-center rounded-full border border-border bg-background pl-4 pr-1 shadow-sm">
      <Text
        className="min-w-12 text-center text-sm font-medium tabular-nums text-foreground"
        accessibilityLabel={`Zoom ${zoomPercent}%`}
      >
        {zoomPercent}%
      </Text>
      <Button
        variant="ghost"
        className="ml-1 min-h-12 min-w-12 rounded-full px-2"
        accessibilityLabel="Centralizar folha atual e restaurar zoom para 100%"
        onPress={centerCurrentPage}
      >
        <ButtonIcon as={Scan} className="h-5 w-5" />
      </Button>
    </Box>
  );
}
