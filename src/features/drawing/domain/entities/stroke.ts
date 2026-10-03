import { SkPaint, SkPath } from "@shopify/react-native-skia";

export interface Stroke {
  id: string;
  pageIndex: number;
  path: SkPath;
  paint: SkPaint;
}
