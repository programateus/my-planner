import { Highlighter } from "lucide-react-native";

import { Button, ButtonIcon } from "@/components/gluestack/button";

import { useDrawingSettings } from "../../contexts/drawing-settings-context";

export function HighlighterButton() {
  const { tool, setTool } = useDrawingSettings();
  const isSelected = tool === "highlighter";

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className="min-h-12 min-w-12"
      accessibilityLabel="Marca-texto"
      accessibilityState={{ selected: isSelected }}
      onPress={() => setTool("highlighter")}
    >
      <ButtonIcon as={Highlighter} className="h-6 w-6" />
    </Button>
  );
}
