import { Canvas, Path, Skia, SkPath } from "@shopify/react-native-skia";
import { useState } from "react";
import { useResolveClassNames } from "uniwind";
import {
  Gesture,
  GestureDetector,
  PointerType,
} from "react-native-gesture-handler";

export function DrawingCanvas() {
  const strokeStyle = useResolveClassNames("text-foreground");
  const strokeColor = typeof strokeStyle.color === "string" ? strokeStyle.color : undefined;
  const [paths, setPaths] = useState<SkPath[]>([]);
  const [currentPath, setCurrentPath] = useState<SkPath | null>(null);

  const gesture = Gesture.Pan()
    .onBegin((event) => {
      if (event.pointerType !== PointerType.STYLUS) return;
      const path = Skia.PathBuilder.Make();

      path.moveTo(event.x, event.y);

      setCurrentPath(path.build());
    })
    .onUpdate((event) => {
      if (event.pointerType !== PointerType.STYLUS) return;
      if (!currentPath) return;

      currentPath.lineTo(event.x, event.y);

      setCurrentPath(currentPath.copy());
    })
    .onEnd((event) => {
      if (event.pointerType !== PointerType.STYLUS) return;
      if (!currentPath) return;

      setPaths((previous) => [...previous, currentPath]);
      setCurrentPath(null);
    })
    .runOnJS(true);

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{ flex: 1 }}>
        {paths.map((path, index) => (
          <Path
            key={index}
            path={path}
            style="stroke"
            strokeWidth={4}
            strokeCap="round"
            strokeJoin="round"
            color={strokeColor}
          />
        ))}

        {currentPath && (
          <Path
            path={currentPath}
            style="stroke"
            strokeWidth={4}
            strokeCap="round"
            strokeJoin="round"
            color={strokeColor}
          />
        )}
      </Canvas>
    </GestureDetector>
  );
}
