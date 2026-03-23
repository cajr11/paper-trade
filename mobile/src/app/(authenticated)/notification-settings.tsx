import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

const STORAGE_KEY = "notification_preferences";

type Preferences = {
  orderFilled: boolean;
  priceAlerts: boolean;
  dailySummary: boolean;
  newListings: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
};

const DEFAULT_PREFS: Preferences = {
  orderFilled: true,
  priceAlerts: true,
  dailySummary: false,
  newListings: true,
  pushNotifications: true,
  emailNotifications: false,
};

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
      }
    } catch {
      // Use defaults
    }
  };

  const updatePref = async (key: keyof Preferences, value: boolean) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Silent
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Trading Section */}
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>Trading</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
            <ToggleRow
              label="Order Filled"
              value={prefs.orderFilled}
              onToggle={(v) => updatePref("orderFilled", v)}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <ToggleRow
              label="Price Alerts"
              value={prefs.priceAlerts}
              onToggle={(v) => updatePref("priceAlerts", v)}
              colors={colors}
            />
          </View>

          {/* Market Section */}
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>Market</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
            <ToggleRow
              label="Daily Summary"
              value={prefs.dailySummary}
              onToggle={(v) => updatePref("dailySummary", v)}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <ToggleRow
              label="New Coin Listings"
              value={prefs.newListings}
              onToggle={(v) => updatePref("newListings", v)}
              colors={colors}
            />
          </View>

          {/* General Section */}
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>General</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
            <ToggleRow
              label="Push Notifications"
              value={prefs.pushNotifications}
              onToggle={(v) => updatePref("pushNotifications", v)}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <ToggleRow
              label="Email Notifications"
              value={prefs.emailNotifications}
              onToggle={(v) => updatePref("emailNotifications", v)}
              colors={colors}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onToggle,
  colors,
}: {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.backgroundElement, true: "#22C55E" }}
        thumbColor="#FFFFFF"
      />
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.two,
    marginTop: Spacing.three,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: "Outfit",
  },
  menuCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Outfit",
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.four,
  },
});
