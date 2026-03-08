import React from "react";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { Image } from "expo-image";
import {
  ColorSchemeName,
  Pressable,
  TextInput,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import FormField from "@/components/composed/FormField";
import CustomButton from "@/components/ui/CustomButton";

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
          paddingHorizontal: 16,
          flex: 1,
        }}
      >
        {/* Header and subtitle */}
        <LogoImage scheme={scheme} />
        <ThemedText
          style={{ width: 160 }}
          type="small"
          themeColor="textSecondary"
        >
          Practice crypto trading. Zero risk. Real prices.
        </ThemedText>

        {/* Form */}
        <ThemedView style={{ marginTop: 60, gap: 30 }}>
          <FormField label="Email" placeholder="you@email.com" />
          <FormField label="Password" placeholder="********" />
          <CustomButton label="Log in" onPress={() => {}} />

          <Pressable>
            <ThemedText type="link" themeColor="secondaryText">
              Forgot password?
            </ThemedText>
          </Pressable>
        </ThemedView>

        {/* Spacer */}
        <ThemedView style={{ flex: 1 }} />

        {/* Alternate action button */}
        <ThemedView style={{ alignItems: "center", paddingBottom: 16 }}>
          <ThemedText type="small" themeColor="secondaryText">
            Don't have an account?{" "}
            <ThemedText type="smallBold" themeColor="text">
              Sign up
            </ThemedText>
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}
