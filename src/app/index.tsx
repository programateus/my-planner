import { DrawingCanvas } from "@/components/drawing-canvas";
import { Box } from "@/components/gluestack/box";

export default function HomeScreen() {
  return (
    <Box className="flex-1 flex-row justify-center bg-background">
      <DrawingCanvas />
    </Box>
  );
}
