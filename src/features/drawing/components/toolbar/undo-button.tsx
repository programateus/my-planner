import { Undo } from "lucide-react-native";

import { Button } from "@/components/gluestack/button";
import { useDrawingActions } from "@/features/drawing/hooks/use-drawing-actions";
import { useDrawingHistory } from "@/features/drawing/hooks/use-drawing-history";

export const UndoButton = () => {
  const { undo } = useDrawingActions();
  const { canUndo } = useDrawingHistory();

  return (
    <Button
      variant="outline"
      className="min-h-12"
      accessibilityLabel="Desfazer"
      disabled={!canUndo}
      isDisabled={!canUndo}
      onPressOut={undo}
    >
      <Undo />
    </Button>
  );
};
