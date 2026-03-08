import { ThemedView } from "../ui/ThemedView";
import { ActivityIndicator } from "react-native";

export default function LoadingScreen() {
  return (
    <ThemedView>
      <ActivityIndicator />
    </ThemedView>
  );
}
