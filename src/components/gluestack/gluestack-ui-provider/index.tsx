import { OverlayProvider } from "@gluestack-ui/core/overlay/creator";
import { ToastProvider } from "@gluestack-ui/core/toast/creator";
import { type ReactNode, useEffect } from "react";
import { View, type ViewProps } from "react-native";
import { Uniwind } from "uniwind";

export type ModeType = "light" | "dark" | "system";

type GluestackUIProviderProps = {
  mode?: ModeType;
  children?: ReactNode;
  style?: ViewProps["style"];
};

export function GluestackUIProvider({
  mode = "system",
  children,
  style,
}: GluestackUIProviderProps) {
  useEffect(() => {
    Uniwind.setTheme(mode);
  }, [mode]);

  return (
    <View style={[{ flex: 1, height: "100%", width: "100%" }, style]}>
      <OverlayProvider>
        <ToastProvider>{children}</ToastProvider>
      </OverlayProvider>
    </View>
  );
}
