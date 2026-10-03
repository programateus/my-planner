import { SkPaint, SkPath } from "@shopify/react-native-skia";

export interface Stroke {
  id: string;
  path: SkPath;
  paint: SkPaint;
}
