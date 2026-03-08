import React from "react";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { Image } from "expo-image";
import { ColorSchemeName, TextInput, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";

const LogoImage = ({ scheme }: { scheme: ColorSchemeName }) => {
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
};

export default function Login() {
  const scheme = useColorScheme();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView
        style={{
          borderWidth: 1,
          paddingHorizontal: 16,
        }}
      >
        <LogoImage scheme={scheme} />
        <ThemedText
          style={{ width: 160 }}
          type="small"
          themeColor="textSecondary"
        >
          Practice crypto trading. Zero risk. Real prices.
        </ThemedText>

        <ThemedView style={{ marginTop: 50 }}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Email
          </ThemedText>
          <TextInput
            style={{
              height: 20,
              width: "100%",
              padding: 16,
              backgroundColor:
                Colors[(scheme as keyof typeof Colors) ?? "light"]
                  .backgroundElement,
            }}
            placeholder="Enter your email"
          />
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}
