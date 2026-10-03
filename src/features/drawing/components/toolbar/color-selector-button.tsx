import { Palette } from "lucide-react-native";
import { useState } from "react";

import { Box } from "@/components/gluestack/box";
import { Button, ButtonIcon } from "@/components/gluestack/button";
import {
  Popover,
  PopoverBackdrop,
  PopoverContent,
} from "@/components/gluestack/popover";
import { Pressable } from "@/components/gluestack/pressable";
import { Text } from "@/components/gluestack/text";

import { useDrawingSettings } from "@/features/drawing/contexts/drawing-settings-context";
import { HIGHLIGHTER_COLORS } from "@/features/drawing/domain/highlighter";

const STROKE_COLORS = [
  { label: "Preto", value: "#0A0A0A" },
  { label: "Branco", value: "#FAFAFA" },
  { label: "Vermelho", value: "#EF4444" },
  { label: "Laranja", value: "#F97316" },
  { label: "Amarelo", value: "#EAB308" },
  { label: "Verde", value: "#22C55E" },
  { label: "Azul", value: "#3B82F6" },
  { label: "Roxo", value: "#8B5CF6" },
] as const;

export const ColorSelectorButton = () => {
  const {
    tool,
    strokeColor,
    setStrokeColor,
    highlighterColor,
    setHighlighterColor,
    setTool,
  } = useDrawingSettings();
  const isHighlighting = tool === "highlighter";
  const selectedColor = isHighlighting ? highlighterColor : strokeColor;
  const colorRows = isHighlighting
    ? [HIGHLIGHTER_COLORS.slice(0, 3), HIGHLIGHTER_COLORS.slice(3)]
    : [STROKE_COLORS.slice(0, 4), STROKE_COLORS.slice(4)];
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  return (
    <Popover
      placement="bottom left"
      offset={8}
      isOpen={isColorPickerOpen}
      onOpen={() => setIsColorPickerOpen(true)}
      onClose={() => setIsColorPickerOpen(false)}
      trigger={(triggerProps) => (
        <Button
          {...triggerProps}
          variant="outline"
          className="min-h-12"
          accessibilityLabel={
            isHighlighting
              ? "Alterar cor do marca-texto"
              : "Alterar cor do traço"
          }
        >
          <Box
            className="h-5 w-5 rounded-full border border-border"
            style={{ backgroundColor: selectedColor }}
          />
          <ButtonIcon as={Palette} className="h-6 w-6" />
        </Button>
      )}
    >
      <PopoverBackdrop />
      <PopoverContent
        className="w-auto gap-2 p-3"
        accessibilityLabel={
          isHighlighting ? "Cores do marca-texto" : "Cores do traço"
        }
      >
        {colorRows.map((row, rowIndex) => (
          <Box key={rowIndex} className="flex-row gap-2">
            {row.map(({ label, value }) => (
              <Pressable
                key={value}
                className="h-12 w-12 items-center justify-center rounded-full border border-border"
                style={{ backgroundColor: value }}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected: selectedColor === value }}
                onPress={() => {
                  if (isHighlighting) {
                    setHighlighterColor(value);
                  } else {
                    setStrokeColor(value);
                    setTool("pen");
                  }
                  setIsColorPickerOpen(false);
                }}
              >
                {selectedColor === value && (
                  <Text
                    className="text-xl font-bold"
                    style={{
                      color:
                        isHighlighting ||
                        value === "#FAFAFA" ||
                        value === "#EAB308"
                          ? "#0A0A0A"
                          : "#FFFFFF",
                    }}
                  >
                    ✓
                  </Text>
                )}
              </Pressable>
            ))}
          </Box>
        ))}
      </PopoverContent>
    </Popover>
  );
};
