import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useUserStore } from "@/stores/user-store";
import { api, ApiError } from "@/lib/api";

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, fetchUser } = useUserStore();

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setEmail(user.email);
      setUsername(user.username ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "?";

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert("Error", "Full name and email are required");
      return;
    }

    setSaving(true);
    try {
      await api.updateProfile({
        full_name: fullName.trim(),
        email: email.trim(),
        username: username.trim() || null,
        phone: phone.trim() || null,
      });
      await fetchUser();
      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      if (error instanceof ApiError) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={[styles.backText, { color: colors.text }]}>{"\u2190"} Back</Text>
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar */}
            <View style={styles.avatarSection}>
              <View style={[styles.avatar, { backgroundColor: colors.backgroundElement }]}>
                <Text style={[styles.avatarText, { color: colors.text }]}>{initials}</Text>
              </View>
              <Pressable>
                <Text style={[styles.changePhoto, { color: colors.secondaryText }]}>Change Photo</Text>
              </Pressable>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full Name"
                placeholderTextColor={colors.placeholder}
              />

              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={[styles.label, { color: colors.text }]}>Username</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
              />

              <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone"
                placeholderTextColor={colors.placeholder}
                keyboardType="phone-pad"
              />
            </View>

            {/* Save Button */}
            {saving ? (
              <ActivityIndicator size="large" style={{ height: 52 }} color={colors.text} />
            ) : (
              <Pressable
                onPress={handleSave}
                style={({ pressed }) => [
                  styles.saveButton,
                  { backgroundColor: colors.buttonPrimary },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[styles.saveButtonText, { color: colors.buttonPrimaryText }]}>
                  Save Changes
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  backButton: {
    paddingVertical: Spacing.two,
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Outfit",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Outfit",
  },
  headerSpacer: {
    width: 50,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Outfit",
  },
  changePhoto: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Outfit",
  },
  formSection: {
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.two,
    marginTop: Spacing.three,
    fontFamily: "Outfit",
  },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    fontFamily: "Outfit",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  saveButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Outfit",
  },
});
