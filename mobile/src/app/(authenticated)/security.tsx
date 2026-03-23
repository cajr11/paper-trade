import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { api, ApiError } from "@/lib/api";

export default function SecurityScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [twoFactor, setTwoFactor] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Error", "Please fill in both fields");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "New password must be at least 8 characters");
      return;
    }

    setSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      Alert.alert("Success", "Password changed successfully");
    } catch (error) {
      if (error instanceof ApiError) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "Failed to change password");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.text }]}>{"\u2190"} Back</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Security</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
            {/* Change Password */}
            <Pressable
              onPress={() => setShowPasswordModal(true)}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: colors.backgroundElement },
              ]}
            >
              <View style={styles.menuItemLeft}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Change Password</Text>
                <Text style={[styles.menuSublabel, { color: colors.secondaryText }]}>
                  Last changed 30 days ago
                </Text>
              </View>
              <Text style={[styles.chevron, { color: colors.placeholder }]}>{"\u203A"}</Text>
            </Pressable>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Two-Factor Authentication */}
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Two-Factor Authentication</Text>
                <Text style={[styles.menuSublabel, { color: colors.secondaryText }]}>
                  Add an extra layer of security
                </Text>
              </View>
              <Switch
                value={twoFactor}
                onValueChange={setTwoFactor}
                trackColor={{ false: colors.backgroundElement, true: "#22C55E" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Biometric Login */}
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Biometric Login</Text>
                <Text style={[styles.menuSublabel, { color: colors.secondaryText }]}>
                  Use Face ID or Fingerprint
                </Text>
              </View>
              <Switch
                value={biometric}
                onValueChange={setBiometric}
                trackColor={{ false: colors.backgroundElement, true: "#22C55E" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Active Sessions */}
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: colors.backgroundElement },
              ]}
            >
              <View style={styles.menuItemLeft}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Active Sessions</Text>
                <Text style={[styles.menuSublabel, { color: colors.secondaryText }]}>
                  Manage devices logged in
                </Text>
              </View>
              <Text style={[styles.chevron, { color: colors.placeholder }]}>{"\u203A"}</Text>
            </Pressable>
          </View>

          {/* Delete Account */}
          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              { backgroundColor: colors.card },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() =>
              Alert.alert(
                "Delete Account",
                "Are you sure you want to delete your account? This action cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive" },
                ],
              )
            }
          >
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </Pressable>
        </ScrollView>

        {/* Password Change Modal */}
        <Modal visible={showPasswordModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Change Password</Text>

              <Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
              />

              <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password (min 8 characters)"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
              />

              <View style={styles.modalButtons}>
                <Pressable
                  onPress={() => {
                    setShowPasswordModal(false);
                    setCurrentPassword("");
                    setNewPassword("");
                  }}
                  style={[styles.modalButton, { backgroundColor: colors.backgroundElement }]}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleChangePassword}
                  disabled={saving}
                  style={[styles.modalButton, { backgroundColor: colors.buttonPrimary }]}
                >
                  <Text style={[styles.modalButtonText, { color: colors.buttonPrimaryText }]}>
                    {saving ? "Saving..." : "Update"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
  menuCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: Spacing.four,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  menuItemLeft: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Outfit",
  },
  menuSublabel: {
    fontSize: 13,
    fontWeight: "400",
    fontFamily: "Outfit",
  },
  chevron: {
    fontSize: 22,
    fontWeight: "300",
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.four,
  },
  deleteButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  deleteButtonText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Outfit",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
  },
  modalContent: {
    borderRadius: 16,
    padding: Spacing.four,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: Spacing.three,
    fontFamily: "Outfit",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.two,
    marginTop: Spacing.two,
    fontFamily: "Outfit",
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    fontFamily: "Outfit",
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Outfit",
  },
});
