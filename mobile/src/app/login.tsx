import React from "react";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";

export default function Login() {
  return (
    <ThemedView
      style={{
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        padding: 16,
      }}
    >
      <ThemedText>Hey</ThemedText>
    </ThemedView>
  );
}
