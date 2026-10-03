import { Picture } from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";

import type { Stroke } from "../../domain/entities/stroke";
import { useCanvasPicture } from "./hooks/use-canvas-picture";

type CommittedStrokesLayerProps = {
  strokes: SharedValue<Stroke[]>;
  pendingStrokes: SharedValue<Stroke[]>;
};

export function CommittedStrokesLayer({
  strokes,
  pendingStrokes,
}: CommittedStrokesLayerProps) {
  const picture = useCanvasPicture(strokes, pendingStrokes);

  return <Picture picture={picture} />;
}
