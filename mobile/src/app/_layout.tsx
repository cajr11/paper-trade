import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import React from "react";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/AnimatedIcon";
import SessionProvider from "@/providers/SessionProvider";
import { Slot } from "expo-router";

export default function BaseLayout() {
  const colorScheme = useColorScheme();

  return (
    <SessionProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Slot />
        <AnimatedSplashOverlay />
      </ThemeProvider>
    </SessionProvider>
  );
}
