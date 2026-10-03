import { Scan } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import Animated, { FadeIn, FadeOut, useAnimatedReaction } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { Box } from "@/components/gluestack/box";
import { Button, ButtonIcon } from "@/components/gluestack/button";
import { Text } from "@/components/gluestack/text";

import { getFitScale } from "../../geometry/notebook-geometry";
import type { CanvasViewport } from "./hooks/gestures/use-viewport-gesture";

const ZOOM_CONTROLS_DURATION = 3000;
const ENTER_ANIMATION = FadeIn.duration(150);
const EXIT_ANIMATION = FadeOut.duration(200);

export function ViewportControls({ viewport }: { viewport: CanvasViewport }) {
  const [zoomPercent, setZoomPercent] = useState<number | null>(null);
  const visible = useRef(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { scale, size, pinching, centerCurrentPage } = viewport;

  const updateZoom = useCallback((percent: number, zooming: boolean, changed: boolean) => {
    if (zooming && changed) visible.current = true;
    if (!visible.current) return;

    setZoomPercent(percent);
    if (hideTimeout.current !== null) clearTimeout(hideTimeout.current);
    hideTimeout.current = null;
    if (!zooming) {
      hideTimeout.current = setTimeout(() => {
        visible.current = false;
        hideTimeout.current = null;
        setZoomPercent(null);
      }, ZOOM_CONTROLS_DURATION);
    }
  }, []);

  useEffect(() => () => {
    if (hideTimeout.current !== null) clearTimeout(hideTimeout.current);
  }, []);

  useAnimatedReaction(
    () => ({
      percent: size.get().width
        ? Math.round(scale.get() / getFitScale(size.get().width) * 100)
        : 100,
      zooming: pinching.get(),
    }),
    (next, previous) => {
      if (previous === null) return;
      const changed = next.percent !== previous.percent;
      if (changed || next.zooming !== previous.zooming) {
        scheduleOnRN(updateZoom, next.percent, next.zooming, changed);
      }
    },
  );

  if (zoomPercent === null) return null;

  return (
    <Animated.View
      entering={ENTER_ANIMATION}
      exiting={EXIT_ANIMATION}
      style={{ position: "absolute", right: 12, top: 12 }}
    >
      <Box className="flex-row items-center rounded-full border border-border bg-background pl-4 pr-1 shadow-sm">
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
    </Animated.View>
  );
}
