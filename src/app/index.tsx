import { Box } from "@/components/gluestack/box";
import { SafeAreaView } from "@/components/gluestack/safe-area-view";
import { DrawingProvider } from "@/features/drawing/contexts/drawing-provider";
import { DrawingCanvas } from "@/features/drawing/components/drawing-canvas";
import { Toolbar } from "@/features/drawing/components/toolbar";

export default function HomeScreen() {
  return (
    <DrawingProvider>
      <Box className="flex-1 bg-background">
        <SafeAreaView style={{ flex: 1 }}>
          <Toolbar />
          <DrawingCanvas />
        </SafeAreaView>
      </Box>
    </DrawingProvider>
  );
}
