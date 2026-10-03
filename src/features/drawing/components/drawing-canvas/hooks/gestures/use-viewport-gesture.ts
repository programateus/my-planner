import { useCallback, useMemo, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Gesture, PointerType } from "react-native-gesture-handler";
import {
  cancelAnimation,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { useDrawingSession } from "../../../../contexts/drawing-session-context";

import {
  clamp,
  constrainOffset,
  getBottomLimit,
  getCenteredPageOffset,
  getFitScale,
  getTopLimit,
  MAX_OVERSCROLL,
  PAGE_STRIDE,
  PAGE_WIDTH,
  shouldAppendPage,
  toDocumentPoint,
  VIEWPORT_PADDING,
  type ViewportSize,
} from "../../../../geometry/notebook-geometry";

export function useViewportGesture(activeStrokePage: SharedValue<number>) {
  const { currentPage } = useDrawingSession();
  const [pageCount, setPageCount] = useState(1);
  const pages = useSharedValue(1);
  const size = useSharedValue<ViewportSize>({ width: 0, height: 0 });
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(VIEWPORT_PADDING);
  const rawY = useSharedValue(VIEWPORT_PADDING);
  const pinching = useSharedValue(false);
  const panning = useSharedValue(false);
  const canAppend = useSharedValue(false);
  const pinchStart = useSharedValue({ scale: 1, x: 0, y: 0 });

  const transform = useDerivedValue(() => [
    { translateX: translateX.get() }, { translateY: translateY.get() }, { scale: scale.get() },
  ]);
  useAnimatedReaction(
    () => clamp(
      Math.floor((size.get().height / 2 - translateY.get()) / scale.get() / PAGE_STRIDE),
      0,
      pages.get() - 1,
    ),
    (next, previous) => {
      if (next !== previous) currentPage.set(next);
    },
  );

  const settle = useCallback(() => {
    "worklet";
    const offset = constrainOffset(
      { x: translateX.get(), y: translateY.get() }, size.get(), scale.get(), pages.get(),
    );
    translateX.set(withTiming(offset.x, { duration: 180 }));
    translateY.set(withTiming(offset.y, { duration: 180 }));
  }, [pages, scale, size, translateX, translateY]);

  const stopAnimation = useCallback(() => {
    "worklet";
    cancelAnimation(scale);
    cancelAnimation(translateX);
    cancelAnimation(translateY);
  }, [scale, translateX, translateY]);

  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .minDistance(4)
      .averageTouches(true)
      .enableTrackpadTwoFingerGesture(true)
      .onStart((event) => {
        panning.set(false);
        if (event.pointerType === PointerType.STYLUS || activeStrokePage.get() !== -1) return;
        panning.set(true);
        stopAnimation();
        rawY.set(translateY.get());
        canAppend.set(event.numberOfPointers === 1);
      })
      .onChange((event) => {
        if (!panning.get() || event.pointerType === PointerType.STYLUS || activeStrokePage.get() !== -1) return;
        if (pinching.get() || event.numberOfPointers > 1) {
          canAppend.set(false);
          rawY.set(translateY.get());
          return;
        }
        const bottom = getBottomLimit(size.get().height, scale.get(), pages.get());
        const top = getTopLimit(size.get().height, scale.get());
        rawY.set(clamp(rawY.get() + event.changeY, bottom - MAX_OVERSCROLL, top + MAX_OVERSCROLL));
        const offset = constrainOffset(
          { x: translateX.get() + event.changeX, y: rawY.get() }, size.get(), scale.get(), pages.get(),
        );
        translateX.set(offset.x);
        translateY.set(rawY.get());
      })
      .onEnd((event, success) => {
        if (!success || !panning.get() || activeStrokePage.get() !== -1 || pinching.get()) return;
        if (canAppend.get() && shouldAppendPage(
          rawY.get(), getBottomLimit(size.get().height, scale.get(), pages.get()), event.translationY,
        )) {
          const count = pages.get() + 1;
          pages.set(count);
          scheduleOnRN(setPageCount, count);
        }
      })
      .onFinalize(() => {
        if (!panning.get()) return;
        panning.set(false);
        canAppend.set(false);
        if (!pinching.get() && activeStrokePage.get() === -1) settle();
      });

    const pinch = Gesture.Pinch()
      .onStart((event) => {
        if (activeStrokePage.get() !== -1) return;
        stopAnimation();
        pinching.set(true);
        canAppend.set(false);
        const point = toDocumentPoint(
          { x: event.focalX, y: event.focalY },
          { x: translateX.get(), y: translateY.get() }, scale.get(),
        );
        pinchStart.set({ scale: scale.get(), ...point });
      })
      .onUpdate((event) => {
        if (!pinching.get() || activeStrokePage.get() !== -1) return;
        const start = pinchStart.get();
        const fit = getFitScale(size.get().width);
        const nextScale = clamp(start.scale * event.scale, fit * 0.5, fit * 4);
        scale.set(nextScale);
        translateX.set(event.focalX - start.x * nextScale);
        translateY.set(event.focalY - start.y * nextScale);
        rawY.set(translateY.get());
      })
      .onFinalize(() => {
        if (!pinching.get()) return;
        pinching.set(false);
        if (activeStrokePage.get() === -1) settle();
      });

    return Gesture.Simultaneous(pan, pinch);
  }, [activeStrokePage, canAppend, pages, panning, pinchStart, pinching, rawY, scale, settle, size, stopAnimation, translateX, translateY]);

  const onLayout = useCallback(({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    if (!layout.width || !layout.height) return;
    const previous = size.get();
    if (previous.width === layout.width && previous.height === layout.height) return;
    stopAnimation();
    const next = { width: layout.width, height: layout.height };
    const fit = getFitScale(next.width);
    const nextScale = previous.width ? scale.get() * fit / getFitScale(previous.width) : fit;
    const center = toDocumentPoint(
      { x: previous.width / 2, y: previous.height / 2 },
      { x: translateX.get(), y: translateY.get() }, scale.get(),
    );
    const offset = constrainOffset(previous.width
      ? { x: next.width / 2 - center.x * nextScale, y: next.height / 2 - center.y * nextScale }
      : { x: (next.width - PAGE_WIDTH * fit) / 2, y: VIEWPORT_PADDING }, next, nextScale, pages.get());
    size.set(next);
    scale.set(nextScale);
    translateX.set(offset.x);
    translateY.set(offset.y);
  }, [pages, scale, size, stopAnimation, translateX, translateY]);

  const centerCurrentPage = useCallback(() => {
    stopAnimation();
    const viewport = size.get();
    if (!viewport.width || activeStrokePage.get() !== -1) return;
    const pageIndex = currentPage.get();
    const nextScale = getFitScale(viewport.width);
    const offset = constrainOffset(
      getCenteredPageOffset(pageIndex, viewport, nextScale),
      viewport,
      nextScale,
      pages.get(),
    );
    scale.set(withTiming(nextScale, { duration: 180 }));
    translateX.set(withTiming(offset.x, { duration: 180 }));
    translateY.set(withTiming(offset.y, { duration: 180 }));
  }, [activeStrokePage, currentPage, pages, scale, size, stopAnimation, translateX, translateY]);

  return {
    gesture,
    onLayout,
    centerCurrentPage,
    transform,
    scale,
    size,
    translateX,
    translateY,
    pages,
    pageCount,
    currentPage,
    pinching,
    stopAnimation,
  };
}

export type CanvasViewport = ReturnType<typeof useViewportGesture>;
