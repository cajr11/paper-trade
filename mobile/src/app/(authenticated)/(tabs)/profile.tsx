import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useUserStore } from "@/stores/user-store";
import { useSession } from "@/providers/SessionProvider";

function formatCurrency(value: number): string {
  return "$" + value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Profile() {
  const { logout } = useSession();
  const { user, loading, fetchUser, clearUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          clearUser();
          logout();
        },
      },
    ]);
  };

  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "?";

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>Profile</Text>

          {/* User Info Card */}
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.userName}>{user?.full_name ?? "Unknown"}</Text>
            <Text style={styles.userEmail}>{user?.email ?? ""}</Text>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Account Balance</Text>
              <Text style={styles.balanceValue}>
                {formatCurrency(user?.balance ?? 0)}
              </Text>
            </View>
          </View>

          {/* Settings Menu */}
          <View style={styles.menuCard}>
            <MenuItem label="Edit Profile" onPress={() => {}} />
            <View style={styles.divider} />
            <MenuItem label="Security" onPress={() => {}} />
            <View style={styles.divider} />
            <MenuItem label="Notification Settings" onPress={() => {}} />
            <View style={styles.divider} />
            <MenuItem label="Help & Support" onPress={() => {}} />
            <View style={styles.divider} />
            <MenuItem label="FAQ" onPress={() => {}} />
          </View>

          {/* Logout */}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MenuItem({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && { backgroundColor: "#F5F5F5" },
      ]}
    >
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.chevron}>{"\u203A"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  safeArea: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: Spacing.four,
    marginTop: Spacing.three,
    fontFamily: "Outfit",
  },
  userCard: {
    backgroundColor: "#FFFFFF",
    padding: Spacing.four,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: Spacing.four,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E0E1E6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    fontFamily: "Outfit",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    fontFamily: "Outfit",
  },
  userEmail: {
    fontSize: 14,
    fontWeight: "400",
    color: "#71717A",
    marginTop: 2,
    fontFamily: "Outfit",
  },
  balanceContainer: {
    alignItems: "center",
    marginTop: Spacing.three,
    gap: 4,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#71717A",
    fontFamily: "Outfit",
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
    fontFamily: "Outfit",
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
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
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    fontFamily: "Outfit",
  },
  chevron: {
    fontSize: 22,
    fontWeight: "300",
    color: "#A0A0A0",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F3",
    marginHorizontal: Spacing.four,
  },
  logoutButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Outfit",
  },
});
