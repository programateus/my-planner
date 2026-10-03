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
import { STROKE_WIDTHS } from "../../domain/stroke-widths";

export function StrokeWidthSelectorButton() {
  const { strokeWidth, setStrokeWidth } = useDrawingSettings();
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
          accessibilityLabel={`Alterar largura do traço, atual ${strokeWidth}`}
          accessibilityState={{ expanded: isOpen }}
        >
          <Svg
            width={24}
            height={24}
            viewBox="0 0 32 32"
            pointerEvents="none"
            accessible={false}
          >
            <Circle cx={16} cy={16} r={strokeWidth} fill={previewColor} />
          </Svg>
          <ButtonIcon as={ChevronDown} className="h-4 w-4" />
        </Button>
      )}
    >
      <PopoverBackdrop />
      <PopoverContent
        className="w-56 gap-1 p-2"
        accessibilityLabel="Largura do traço"
      >
        {STROKE_WIDTHS.map(({ label, value }) => (
          <Pressable
            key={value}
            className={`min-h-12 flex-row items-center justify-between gap-4 rounded-lg px-3 ${
              strokeWidth === value ? "bg-accent" : ""
            }`}
            accessibilityRole="button"
            accessibilityLabel={`${label}, largura ${value}`}
            accessibilityState={{ selected: strokeWidth === value }}
            onPress={() => {
              setStrokeWidth(value);
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
                d="M 10 27 C 21 10 30 10 40 23 S 58 31 69 17 S 88 10 102 20"
                fill="none"
                stroke={previewColor}
                strokeWidth={value}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Svg
              width={32}
              height={40}
              viewBox="0 0 32 40"
              pointerEvents="none"
              accessible={false}
            >
              <Circle cx={16} cy={20} r={value} fill={previewColor} />
            </Svg>
          </Pressable>
        ))}
      </PopoverContent>
    </Popover>
  );
}
