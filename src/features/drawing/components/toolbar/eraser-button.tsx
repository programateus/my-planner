import { Eraser } from "lucide-react-native";

import { Button, ButtonIcon } from "@/components/gluestack/button";

import { useDrawingSettings } from "@/features/drawing/contexts/drawing-settings-context";

export function EraserButton() {
  const { tool, setTool } = useDrawingSettings();
  const isSelected = tool === "eraser";

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className="min-h-12 min-w-12"
      accessibilityLabel="Borracha"
      accessibilityState={{ selected: isSelected }}
      onPress={() => setTool("eraser")}
    >
      <ButtonIcon as={Eraser} className="h-6 w-6" />
    </Button>
  );
}
