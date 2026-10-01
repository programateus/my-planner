import "@/global.css";

import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { GluestackUIProvider } from "@/components/gluestack/gluestack-ui-provider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <KeyboardProvider preload={false}>
          <GluestackUIProvider mode="system">
            <Slot />
            <AnimatedSplashOverlay />
          </GluestackUIProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
