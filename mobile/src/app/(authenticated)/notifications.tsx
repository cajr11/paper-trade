import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useNotificationStore } from "@/stores/notification-store";
import type { Notification } from "@/lib/api";

function getNotificationIcon(type: Notification["type"], title: string) {
  if (type === "order_filled") {
    const isBuy = title.toLowerCase().includes("buy");
    return { icon: isBuy ? "\u2193" : "\u2191", color: isBuy ? "#22C55E" : "#EF4444", bg: isBuy ? "#DCFCE7" : "#FEE2E2" };
  }
  if (type === "price_alert") {
    return { icon: "\u2197", color: "#F97316", bg: "#FFF7ED" };
  }
  if (type === "new_listing") {
    return { icon: "\u2605", color: "#3B82F6", bg: "#EFF6FF" };
  }
  return { icon: "\u2139", color: "#6B7280", bg: "#F3F4F6" };
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDateGroup(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const notifDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (notifDate.getTime() === today.getTime()) return "Today";
  if (notifDate.getTime() === yesterday.getTime()) return "Yesterday";
  return "Earlier";
}

function groupNotifications(notifications: Notification[]): { title: string; data: Notification[] }[] {
  const groups: Record<string, Notification[]> = {};
  const order = ["Today", "Yesterday", "Earlier"];

  for (const n of notifications) {
    const group = getDateGroup(n.created_at);
    if (!groups[group]) groups[group] = [];
    groups[group].push(n);
  }

  return order
    .filter((title) => groups[title]?.length > 0)
    .map((title) => ({ title, data: groups[title] }));
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    notifications,
    loading,
    refreshing,
    fetchNotifications,
    refreshNotifications,
    markAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handlePress = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const grouped = groupNotifications(notifications);

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
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.text }]}>{"\u2190"} Back</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshNotifications} />
          }
        >
          {notifications.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                No notifications yet
              </Text>
            </View>
          ) : (
            grouped.map((group) => (
              <View key={group.title}>
                <Text style={[styles.groupTitle, { color: colors.secondaryText }]}>
                  {group.title}
                </Text>
                {group.data.map((notification) => {
                  const { icon, color, bg } = getNotificationIcon(notification.type, notification.title);
                  return (
                    <Pressable
                      key={notification.id}
                      onPress={() => handlePress(notification)}
                      style={({ pressed }) => [
                        styles.notificationRow,
                        { backgroundColor: colors.card },
                        !notification.read && { backgroundColor: colors.card, borderLeftWidth: 3, borderLeftColor: color },
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <View style={[styles.iconCircle, { backgroundColor: bg }]}>
                        <Text style={[styles.iconText, { color }]}>{icon}</Text>
                      </View>
                      <View style={styles.notifContent}>
                        <Text
                          style={[
                            styles.notifTitle,
                            { color: colors.text },
                            !notification.read && { fontWeight: "700" },
                          ]}
                        >
                          {notification.title}
                        </Text>
                        <Text style={[styles.notifBody, { color: colors.secondaryText }]} numberOfLines={2}>
                          {notification.body}
                        </Text>
                      </View>
                      <Text style={[styles.notifTime, { color: colors.secondaryText }]}>
                        {formatTime(notification.created_at)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))
          )}
        </ScrollView>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.two,
    marginTop: Spacing.three,
    fontFamily: "Outfit",
  },
  notificationRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.three,
    borderRadius: 12,
    marginBottom: Spacing.two,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 18,
    fontWeight: "700",
  },
  notifContent: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Outfit",
  },
  notifBody: {
    fontSize: 13,
    fontWeight: "400",
    fontFamily: "Outfit",
  },
  notifTime: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Outfit",
    marginLeft: 8,
  },
  emptyCard: {
    padding: Spacing.four,
    borderRadius: 16,
    alignItems: "center",
    marginTop: Spacing.four,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Outfit",
  },
});
