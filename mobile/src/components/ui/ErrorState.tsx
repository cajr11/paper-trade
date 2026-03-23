import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import CustomButton from "@/components/ui/CustomButton";
import { Spacing } from "@/constants/theme";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export default function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="default" style={styles.message}>
          {message}
        </ThemedText>
        {onRetry && (
          <View style={styles.buttonContainer}>
            <CustomButton label="Try Again" onPress={onRetry} />
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
  },
  content: {
    alignItems: "center",
    gap: Spacing.four,
  },
  message: {
    textAlign: "center",
  },
  buttonContainer: {
    width: 160,
  },
});
