import React, { useCallback, useEffect } from "react";
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
import { useNavigation, useRouter } from "expo-router";

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
  const router = useRouter();
  const { logout } = useSession();
  const { colors } = useTheme();
  const { user, loading, fetchUser, clearUser } = useUserStore();

  const navigation = useNavigation();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Re-fetch user data when the screen gains focus (e.g. after a trade)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUser();
    });
    return unsubscribe;
  }, [navigation, fetchUser]);

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
      <View style={[styles.centered, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.header, { color: colors.text }]}>Profile</Text>

          {/* User Info Card */}
          <View style={[styles.userCard, { backgroundColor: colors.card }]}>
            <View style={[styles.avatar, { backgroundColor: colors.backgroundElement }]}>
              <Text style={[styles.avatarText, { color: colors.text }]}>{initials}</Text>
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.full_name ?? "Unknown"}</Text>
            <Text style={[styles.userEmail, { color: colors.secondaryText }]}>{user?.email ?? ""}</Text>
            <View style={styles.balanceContainer}>
              <Text style={[styles.balanceLabel, { color: colors.secondaryText }]}>Account Balance</Text>
              <Text style={[styles.balanceValue, { color: colors.text }]}>
                {formatCurrency(user?.balance ?? 0)}
              </Text>
            </View>
          </View>

          {/* Settings Menu */}
          <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
            <MenuItem label="Edit Profile" onPress={() => router.push("/(authenticated)/edit-profile")} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <MenuItem label="Security" onPress={() => router.push("/(authenticated)/security")} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <MenuItem label="Notifications" onPress={() => router.push("/(authenticated)/notification-settings")} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <MenuItem label="Help & Support" onPress={() => router.push("/(authenticated)/help-support")} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <MenuItem label="FAQ" onPress={() => router.push("/(authenticated)/faq")} />
          </View>

          {/* Logout */}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              { backgroundColor: colors.card },
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
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && { backgroundColor: colors.backgroundElement },
      ]}
    >
      <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.chevron, { color: colors.placeholder }]}>{"\u203A"}</Text>
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
    fontSize: 28,
    fontWeight: "700",
    marginBottom: Spacing.four,
    marginTop: Spacing.three,
    fontFamily: "Outfit",
  },
  userCard: {
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Outfit",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Outfit",
  },
  userEmail: {
    fontSize: 14,
    fontWeight: "400",
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
    fontFamily: "Outfit",
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Outfit",
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
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
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
  logoutButton: {
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
  logoutText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Outfit",
  },
});
