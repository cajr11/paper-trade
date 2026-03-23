import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useUserStore } from "@/stores/user-store";
import { useSession } from "@/providers/SessionProvider";

function formatCurrency(value: number): string {
  return "$" + value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Profile() {
  const { colors } = useTheme();
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

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="subtitle" style={styles.header}>
            Profile
          </ThemedText>

          {/* User Info Card */}
          <ThemedView type="backgroundElement" style={styles.userCard}>
            <View style={styles.avatarContainer}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: colors.backgroundSelected },
                ]}
              >
                <ThemedText type="subtitle" style={styles.avatarText}>
                  {user?.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() ?? "?"}
                </ThemedText>
              </View>
            </View>
            <ThemedText type="default" style={styles.userName}>
              {user?.full_name ?? "Unknown"}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {user?.email ?? ""}
            </ThemedText>
            <View style={styles.balanceContainer}>
              <ThemedText type="small" themeColor="textSecondary">
                Account Balance
              </ThemedText>
              <ThemedText type="default" style={styles.balanceValue}>
                {formatCurrency(user?.balance ?? 0)}
              </ThemedText>
            </View>
          </ThemedView>

          {/* Settings Menu */}
          <ThemedView type="backgroundElement" style={styles.menuCard}>
            <MenuItem label="Edit Profile" colors={colors} onPress={() => {}} />
            <View style={[styles.divider, { backgroundColor: colors.background }]} />
            <MenuItem
              label="Security Settings"
              colors={colors}
              onPress={() => {}}
            />
            <View style={[styles.divider, { backgroundColor: colors.background }]} />
            <MenuItem
              label="Notification Settings"
              colors={colors}
              onPress={() => {}}
            />
            <View style={[styles.divider, { backgroundColor: colors.background }]} />
            <MenuItem
              label="Help & Support"
              colors={colors}
              onPress={() => {}}
            />
            <View style={[styles.divider, { backgroundColor: colors.background }]} />
            <MenuItem label="FAQ" colors={colors} onPress={() => {}} />
          </ThemedView>

          {/* Logout */}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              { backgroundColor: colors.backgroundElement },
              pressed && { opacity: 0.7 },
            ]}
          >
            <ThemedText type="default" style={styles.logoutText}>
              Log Out
            </ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function MenuItem({
  label,
  colors,
  onPress,
}: {
  label: string;
  colors: Record<string, string>;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && { backgroundColor: colors.backgroundSelected },
      ]}
    >
      <ThemedText type="default">{label}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {">"}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
  },
  header: {
    marginBottom: Spacing.four,
    marginTop: Spacing.three,
  },
  userCard: {
    padding: Spacing.four,
    borderRadius: 16,
    alignItems: "center",
    gap: Spacing.one,
    marginBottom: Spacing.four,
  },
  avatarContainer: {
    marginBottom: Spacing.two,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    lineHeight: 32,
  },
  userName: {
    fontWeight: "700",
    fontSize: 18,
  },
  balanceContainer: {
    alignItems: "center",
    marginTop: Spacing.three,
    gap: 4,
  },
  balanceValue: {
    fontWeight: "700",
    fontSize: 20,
  },
  menuCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: Spacing.four,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.three,
  },
  logoutButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "700",
  },
});
