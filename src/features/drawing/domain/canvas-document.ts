import { SharedValue } from "react-native-reanimated";
import { Stroke } from "./entities/stroke";

export interface CanvasDocument {
  addStroke(stroke: Stroke): void;
  removeStroke(stroke: Stroke): void;
  getStrokes(): SharedValue<Stroke[]>;
}
