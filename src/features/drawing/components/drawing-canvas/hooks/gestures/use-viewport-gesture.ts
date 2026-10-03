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

import { useDrawingSession } from "@/features/drawing/contexts/drawing-session-context";

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
} from "@/features/drawing/geometry/notebook-geometry";

export function useViewportGesture(activeStrokePage: SharedValue<number>) {
  const { currentPage, document } = useDrawingSession();
  const [pageCount, updatePageCount] = useState(() => document.getPageCount());
  const pages = useSharedValue(pageCount);
  const setPageCount = useCallback(
    (count: number) => {
      document.setPageCount(count);
      updatePageCount(count);
    },
    [document],
  );
  const size = useSharedValue<ViewportSize>({ width: 0, height: 0 });
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(VIEWPORT_PADDING);
  const pinching = useSharedValue(false);
  const panning = useSharedValue(false);
  const panSucceeded = useSharedValue(false);
  const dragY = useSharedValue(0);
  const pinchStartScale = useSharedValue(1);

  const transform = useDerivedValue(() => [
    { translateX: translateX.get() },
    { translateY: translateY.get() },
    { scale: scale.get() },
  ]);
  useAnimatedReaction(
    () =>
      clamp(
        Math.floor(
          (size.get().height / 2 - translateY.get()) /
            scale.get() /
            PAGE_STRIDE,
        ),
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
      { x: translateX.get(), y: translateY.get() },
      size.get(),
      scale.get(),
      pages.get(),
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
    const finishGesture = () => {
      "worklet";
      if (panning.get() || pinching.get()) return;
      if (activeStrokePage.get() === -1) {
        if (
          panSucceeded.get() &&
          shouldAppendPage(
            translateY.get(),
            getBottomLimit(size.get().height, scale.get(), pages.get()),
            dragY.get(),
          )
        ) {
          const count = pages.get() + 1;
          pages.set(count);
          scheduleOnRN(setPageCount, count);
        }
        settle();
      }
      panSucceeded.set(false);
    };

    const pan = Gesture.Pan()
      .minDistance(4)
      .averageTouches(true)
      .enableTrackpadTwoFingerGesture(true)
      .onStart((event) => {
        panning.set(false);
        if (
          event.pointerType === PointerType.STYLUS ||
          activeStrokePage.get() !== -1
        )
          return;
        panning.set(true);
        stopAnimation();
        dragY.set(0);
        panSucceeded.set(false);
      })
      .onChange((event) => {
        if (
          !panning.get() ||
          event.pointerType === PointerType.STYLUS ||
          activeStrokePage.get() !== -1
        )
          return;
        const bottom = getBottomLimit(
          size.get().height,
          scale.get(),
          pages.get(),
        );
        const top = getTopLimit(size.get().height, scale.get());
        const nextY = clamp(
          translateY.get() + event.changeY,
          bottom - MAX_OVERSCROLL,
          top + MAX_OVERSCROLL,
        );
        const offset = constrainOffset(
          { x: translateX.get() + event.changeX, y: nextY },
          size.get(),
          scale.get(),
          pages.get(),
        );
        translateX.set(offset.x);
        translateY.set(nextY);
        dragY.set(event.translationY);
      })
      .onEnd((event, success) => {
        if (!panning.get()) return;
        dragY.set(event.translationY);
        panSucceeded.set(success && activeStrokePage.get() === -1);
      })
      .onFinalize(() => {
        if (!panning.get()) return;
        panning.set(false);
        finishGesture();
      });

    const pinch = Gesture.Pinch()
      .onStart(() => {
        if (activeStrokePage.get() !== -1) return;
        stopAnimation();
        pinching.set(true);
        pinchStartScale.set(scale.get());
      })
      .onUpdate((event) => {
        if (
          !pinching.get() ||
          event.numberOfPointers < 2 ||
          activeStrokePage.get() !== -1
        )
          return;
        const previousScale = scale.get();
        const point = toDocumentPoint(
          { x: event.focalX, y: event.focalY },
          { x: translateX.get(), y: translateY.get() },
          previousScale,
        );
        const fit = getFitScale(size.get().width);
        const nextScale = clamp(
          pinchStartScale.get() * event.scale,
          fit * 0.5,
          fit * 4,
        );
        scale.set(nextScale);
        translateX.set(event.focalX - point.x * nextScale);
        translateY.set(event.focalY - point.y * nextScale);
      })
      .onFinalize(() => {
        if (!pinching.get()) return;
        pinching.set(false);
        finishGesture();
      });

    return Gesture.Simultaneous(pan, pinch);
  }, [
    activeStrokePage,
    dragY,
    pages,
    panning,
    panSucceeded,
    pinchStartScale,
    pinching,
    scale,
    settle,
    setPageCount,
    size,
    stopAnimation,
    translateX,
    translateY,
  ]);

  const onLayout = useCallback(
    ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
      if (!layout.width || !layout.height) return;
      const previous = size.get();
      if (previous.width === layout.width && previous.height === layout.height)
        return;
      stopAnimation();
      const next = { width: layout.width, height: layout.height };
      const fit = getFitScale(next.width);
      const nextScale = previous.width
        ? (scale.get() * fit) / getFitScale(previous.width)
        : fit;
      const center = toDocumentPoint(
        { x: previous.width / 2, y: previous.height / 2 },
        { x: translateX.get(), y: translateY.get() },
        scale.get(),
      );
      const offset = constrainOffset(
        previous.width
          ? {
              x: next.width / 2 - center.x * nextScale,
              y: next.height / 2 - center.y * nextScale,
            }
          : { x: (next.width - PAGE_WIDTH * fit) / 2, y: VIEWPORT_PADDING },
        next,
        nextScale,
        pages.get(),
      );
      size.set(next);
      scale.set(nextScale);
      translateX.set(offset.x);
      translateY.set(offset.y);
    },
    [pages, scale, size, stopAnimation, translateX, translateY],
  );

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
  }, [
    activeStrokePage,
    currentPage,
    pages,
    scale,
    size,
    stopAnimation,
    translateX,
    translateY,
  ]);

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
