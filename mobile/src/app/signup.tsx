import React, { useState } from "react";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "@/components/composed/FormField";
import CustomButton from "@/components/ui/CustomButton";
import LogoImage from "@/components/composed/LogoImage";
import { useRouter } from "expo-router";
import { api, ApiError } from "@/lib/api";
import { useSession } from "@/providers/SessionProvider";

export default function Signup() {
  const router = useRouter();
  const scheme = useColorScheme();
  const { login } = useSession();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await api.signup(fullName.trim(), email.trim(), password);
      login(response.token);
      router.replace("/(authenticated)/(tabs)" as any);
    } catch (error) {
      if (error instanceof ApiError) {
        Alert.alert("Signup Failed", error.message);
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
          <FormField
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
          <FormField
            label="Email"
            placeholder="you@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <FormField
            label="Password"
            placeholder="********"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {loading ? (
            <ActivityIndicator size="large" style={{ height: 52 }} />
          ) : (
            <CustomButton label="Create Account" onPress={handleSignup} />
          )}
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
