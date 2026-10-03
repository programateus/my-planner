import { Undo } from "lucide-react-native";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/gluestack/button";
import { useCanvas } from "@/contexts/canvas-context";

export const UndoButton = () => {
  const { history } = useCanvas();
  useSyncExternalStore(
    (cb) => history.subscribe(cb),
    () => history.snapshot(),
  );

  return (
    <Button
      variant="outline"
      className="min-h-12"
      accessibilityLabel="Desfazer"
      disabled={!history.canUndo}
      isDisabled={!history.canUndo}
      onPressOut={() => history.undo()}
    >
      <Undo />
    </Button>
  );
};
