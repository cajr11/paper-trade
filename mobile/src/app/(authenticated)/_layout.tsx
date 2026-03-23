import { Stack } from "expo-router";
import React from "react";

export default function AuthenticatedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="trade"
        options={{
          presentation: "card",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="holdings"
        options={{
          presentation: "card",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          presentation: "card",
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
