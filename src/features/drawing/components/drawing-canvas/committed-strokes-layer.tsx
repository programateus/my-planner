import { Picture } from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";

import type { RenderedStroke } from "../../services/render-stroke";
import { useCanvasPicture } from "./hooks/use-canvas-picture";

type CommittedStrokesLayerProps = {
  strokes: SharedValue<RenderedStroke[]>;
  pendingStrokes: SharedValue<RenderedStroke[]>;
};

export function CommittedStrokesLayer({
  strokes,
  pendingStrokes,
}: CommittedStrokesLayerProps) {
  const picture = useCanvasPicture(strokes, pendingStrokes);

  return <Picture picture={picture} />;
}
