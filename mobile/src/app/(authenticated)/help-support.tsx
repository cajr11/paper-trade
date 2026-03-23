import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

type HelpMenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
};

const MENU_ITEMS: HelpMenuItem[] = [
  { icon: "help-circle-outline", label: "FAQ", route: "/(authenticated)/faq" },
  { icon: "mail-outline", label: "Contact Support" },
  { icon: "flag-outline", label: "Report a Problem" },
  { icon: "document-text-outline", label: "Terms & Privacy Policy" },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = searchQuery
    ? MENU_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : MENU_ITEMS;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.text }]}>{"\u2190"} Back</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Bar */}
          <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
            <Ionicons name="search-outline" size={18} color={colors.placeholder} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search help articles..."
              placeholderTextColor={colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Menu Items */}
          <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
            {filteredItems.map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
                <Pressable
                  onPress={() => {
                    if (item.route) {
                      router.push(item.route as never);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && { backgroundColor: colors.backgroundElement },
                  ]}
                >
                  <Ionicons name={item.icon} size={22} color={colors.text} />
                  <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.chevron, { color: colors.placeholder }]}>{"\u203A"}</Text>
                </Pressable>
              </React.Fragment>
            ))}
          </View>

          {/* Version */}
          <Text style={[styles.version, { color: colors.secondaryText }]}>Version 1.0.0</Text>
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    gap: 8,
    marginBottom: Spacing.four,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: 12,
  },
  menuLabel: {
    flex: 1,
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
  version: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "400",
    fontFamily: "Outfit",
    marginTop: Spacing.four,
  },
});
