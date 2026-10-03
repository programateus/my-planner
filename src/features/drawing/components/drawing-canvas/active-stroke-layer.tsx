import { Path, type SkPath } from "@shopify/react-native-skia";
import type { DerivedValue, SharedValue } from "react-native-reanimated";

type ActiveStrokeLayerProps = {
  path: DerivedValue<SkPath>;
  color: SharedValue<string>;
  width: SharedValue<number>;
};

export function ActiveStrokeLayer({ path, color, width }: ActiveStrokeLayerProps) {
  return (
    <Path
      path={path}
      style="stroke"
      strokeWidth={width}
      strokeCap="round"
      strokeJoin="round"
      color={color}
    />
  );
}
