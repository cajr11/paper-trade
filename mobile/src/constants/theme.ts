/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    secondaryText: "#71717A",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
    surface: "#F5F5F5",
    card: "#FFFFFF",
    border: "#F0F0F3",
    placeholder: "#A0A0A0",
    gain: "#22C55E",
    loss: "#EF4444",
    pillActive: "#000000",
    pillActiveText: "#FFFFFF",
    pillInactive: "#FFFFFF",
    icon: "#000000",
    buttonPrimary: "#000000",
    buttonPrimaryText: "#FFFFFF",
  },
  dark: {
    text: "#ffffff",
    secondaryText: "#9CA3AF",
    background: "#000000",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
    surface: "#111111",
    card: "#1C1C1E",
    border: "#2C2C2E",
    placeholder: "#6B7280",
    gain: "#22C55E",
    loss: "#EF4444",
    pillActive: "#FFFFFF",
    pillActiveText: "#000000",
    pillInactive: "#1C1C1E",
    icon: "#FFFFFF",
    buttonPrimary: "#FFFFFF",
    buttonPrimaryText: "#000000",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
