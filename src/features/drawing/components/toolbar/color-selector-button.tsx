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

import { useDrawingSettings } from "../../contexts/drawing-settings-context";

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

const COLOR_ROWS = [STROKE_COLORS.slice(0, 4), STROKE_COLORS.slice(4)];

export const ColorSelectorButton = () => {
  const { strokeColor, setStrokeColor } = useDrawingSettings();
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
          accessibilityLabel="Alterar cor do traço"
        >
          <Box
            className="h-5 w-5 rounded-full border border-border"
            style={{ backgroundColor: strokeColor }}
          />
          <ButtonIcon as={Palette} className="h-6 w-6" />
        </Button>
      )}
    >
      <PopoverBackdrop />
      <PopoverContent
        className="w-auto gap-2 p-3"
        accessibilityLabel="Cores do traço"
      >
        {COLOR_ROWS.map((row, rowIndex) => (
          <Box key={rowIndex} className="flex-row gap-2">
            {row.map(({ label, value }) => (
              <Pressable
                key={value}
                className="h-12 w-12 items-center justify-center rounded-full border border-border"
                style={{ backgroundColor: value }}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected: strokeColor === value }}
                onPress={() => {
                  setStrokeColor(value);
                  setIsColorPickerOpen(false);
                }}
              >
                {strokeColor === value && (
                  <Text
                    className="text-xl font-bold"
                    style={{
                      color:
                        value === "#FAFAFA" || value === "#EAB308"
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
