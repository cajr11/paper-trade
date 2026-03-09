import React from "react";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { Pressable, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "@/components/composed/FormField";
import CustomButton from "@/components/ui/CustomButton";
import LogoImage from "@/components/composed/LogoImage";
import { useRouter } from "expo-router";

export default function Signup() {
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
        <View>
          <ThemedText type="small" themeColor="textSecondary">
            Create your account.
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Start with $10,000 virtual cash
          </ThemedText>
        </View>

        {/* Form */}
        <ThemedView style={{ marginTop: 60, gap: 30 }}>
          <FormField label="Full Name" placeholder="John Doe" />
          <FormField label="Email" placeholder="you@email.com" />
          <FormField label="Password" placeholder="********" />
          <CustomButton label="Create Account" onPress={() => {}} />

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
          onPress={() => router.replace("/login")}
          style={{ alignItems: "center", paddingBottom: 16 }}
        >
          <ThemedText type="small" themeColor="secondaryText">
            Already have an account?{" "}
            <ThemedText type="smallBold" themeColor="text">
              Log in
            </ThemedText>
          </ThemedText>
        </Pressable>
      </ThemedView>
    </SafeAreaView>
  );
}
