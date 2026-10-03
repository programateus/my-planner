import { Path, type SkPath } from "@shopify/react-native-skia";
import type { DerivedValue, SharedValue } from "react-native-reanimated";

type ActiveStrokeLayerProps = {
  path: DerivedValue<SkPath>;
  color: SharedValue<string>;
  blendMode: SharedValue<"clear" | "srcOver">;
};

export function ActiveStrokeLayer({
  path,
  color,
  blendMode,
}: ActiveStrokeLayerProps) {
  return <Path path={path} style="fill" color={color} blendMode={blendMode} />;
}
