import { Redo } from "lucide-react-native";

import { Button } from "@/components/gluestack/button";
import { useDrawingActions } from "@/features/drawing/hooks/use-drawing-actions";
import { useDrawingHistory } from "@/features/drawing/hooks/use-drawing-history";

export const RedoButton = () => {
  const { redo } = useDrawingActions();
  const { canRedo } = useDrawingHistory();

  return (
    <Button
      variant="outline"
      className="min-h-12"
      accessibilityLabel="Refazer"
      disabled={!canRedo}
      isDisabled={!canRedo}
      onPressOut={redo}
    >
      <Redo />
    </Button>
  );
};
