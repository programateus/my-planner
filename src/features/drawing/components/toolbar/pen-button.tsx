import { Pen } from "lucide-react-native";

import { Button, ButtonIcon } from "@/components/gluestack/button";

import { useDrawingSettings } from "@/features/drawing/contexts/drawing-settings-context";

export function PenButton() {
  const { tool, setTool } = useDrawingSettings();
  const isSelected = tool === "pen";

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className="min-h-12 min-w-12"
      accessibilityLabel="Caneta"
      accessibilityState={{ selected: isSelected }}
      onPress={() => setTool("pen")}
    >
      <ButtonIcon as={Pen} className="h-6 w-6" />
    </Button>
  );
}
