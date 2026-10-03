import { ChevronDown } from "lucide-react-native";
import { useState } from "react";
import Svg, { Circle, Path } from "react-native-svg";
import { useUniwind } from "uniwind";

import { Button, ButtonIcon } from "@/components/gluestack/button";
import {
  Popover,
  PopoverBackdrop,
  PopoverContent,
} from "@/components/gluestack/popover";
import { Pressable } from "@/components/gluestack/pressable";

import { useDrawingSettings } from "../../contexts/drawing-settings-context";
import { ERASER_WIDTHS, STROKE_WIDTHS } from "../../domain/stroke-widths";

export function StrokeWidthSelectorButton() {
  const { tool, strokeWidth, setStrokeWidth, eraserWidth, setEraserWidth } =
    useDrawingSettings();
  const isErasing = tool === "eraser";
  const selectedWidth = isErasing ? eraserWidth : strokeWidth;
  const setWidth = isErasing ? setEraserWidth : setStrokeWidth;
  const widths = isErasing ? ERASER_WIDTHS : STROKE_WIDTHS;
  const widthLabel = isErasing ? "Tamanho da borracha" : "Largura do traço";
  const { theme } = useUniwind();
  const previewColor = theme === "dark" ? "#FAFAFA" : "#0A0A0A";
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      placement="bottom left"
      offset={8}
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      trigger={(triggerProps) => (
        <Button
          {...triggerProps}
          variant="outline"
          className="min-h-12 gap-2 px-3"
          accessibilityLabel={`${widthLabel}, atual ${selectedWidth}`}
          accessibilityState={{ expanded: isOpen }}
        >
          <Svg
            width={24}
            height={24}
            viewBox="-4 -4 40 40"
            pointerEvents="none"
            accessible={false}
          >
            <Circle cx={16} cy={16} r={selectedWidth / 2} fill={previewColor} />
          </Svg>
          <ButtonIcon as={ChevronDown} className="h-4 w-4" />
        </Button>
      )}
    >
      <PopoverBackdrop />
      <PopoverContent
        className="w-56 gap-1 p-2"
        accessibilityLabel={widthLabel}
      >
        {widths.map(({ label, value }) => (
          <Pressable
            key={`${tool}-${value}`}
            className={`min-h-12 flex-row items-center justify-between gap-4 rounded-lg px-3 ${
              selectedWidth === value ? "bg-accent" : ""
            }`}
            accessibilityRole="button"
            accessibilityLabel={`${label}, largura ${value}`}
            accessibilityState={{ selected: selectedWidth === value }}
            onPress={() => {
              setWidth(value);
              setIsOpen(false);
            }}
          >
            <Svg
              width={112}
              height={40}
              viewBox="0 0 112 40"
              pointerEvents="none"
              accessible={false}
            >
              <Path
                d={
                  isErasing
                    ? "M 20 20 H 92"
                    : "M 10 27 C 21 10 30 10 40 23 S 58 31 69 17 S 88 10 102 20"
                }
                fill="none"
                stroke={previewColor}
                strokeWidth={value}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Svg
              width={40}
              height={40}
              viewBox="0 0 40 40"
              pointerEvents="none"
              accessible={false}
            >
              <Circle cx={20} cy={20} r={value / 2} fill={previewColor} />
            </Svg>
          </Pressable>
        ))}
      </PopoverContent>
    </Popover>
  );
}
