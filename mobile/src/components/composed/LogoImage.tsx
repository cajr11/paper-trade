import { ColorSchemeName } from "react-native";
import { ThemedView } from "../ui/ThemedView";
import { Image } from "expo-image";

export default function LogoImage({ scheme }: { scheme: ColorSchemeName }) {
  if (scheme !== "dark") {
    return (
      <ThemedView>
        <Image
          source={require("@/assets/images/paper-trade-logo.png")}
          style={{ width: 180, height: 80 }}
          contentFit="contain"
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView>
      <Image
        source={require("@/assets/images/paper-trade-logo-light.png")}
        style={{ width: 180, height: 80 }}
        contentFit="contain"
      />
    </ThemedView>
  );
}
