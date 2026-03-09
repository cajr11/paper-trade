import React from "react";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { Pressable, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "@/components/composed/FormField";
import CustomButton from "@/components/ui/CustomButton";
import LogoImage from "@/components/composed/LogoImage";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();
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
        <Pressable
          onPress={() => router.replace("/signup")}
          style={{ alignItems: "center", paddingBottom: 16 }}
        >
          <ThemedText type="small" themeColor="secondaryText">
            Don't have an account?{" "}
            <ThemedText type="smallBold" themeColor="text">
              Sign up
            </ThemedText>
          </ThemedText>
        </Pressable>
      </ThemedView>
    </SafeAreaView>
  );
}
