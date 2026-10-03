import { Redo } from "lucide-react-native";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/gluestack/button";
import { useCanvas } from "@/contexts/canvas-context";

export const RedoButton = () => {
  const { history } = useCanvas();
  useSyncExternalStore(
    (cb) => history.subscribe(cb),
    () => history.snapshot(),
  );

  return (
    <Button
      variant="outline"
      className="min-h-12"
      accessibilityLabel="Refazer"
      disabled={!history.canRedo}
      isDisabled={!history.canRedo}
      onPressOut={() => history.redo()}
    >
      <Redo />
    </Button>
  );
};
