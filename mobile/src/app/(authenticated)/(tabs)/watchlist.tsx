import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import CoinIcon, { getCoinName } from "@/components/ui/CoinIcon";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useWatchlistStore } from "@/stores/watchlist-store";
import type { WatchlistItem } from "@/lib/api";

export default function Watchlist() {
  const router = useRouter();
  const { colors } = useTheme();
  const { items, loading, refreshing, fetchWatchlist, refreshWatchlist, removeItem } =
    useWatchlistStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const onRefresh = useCallback(() => {
    refreshWatchlist();
  }, [refreshWatchlist]);

  const filtered = search.trim()
    ? items.filter((item) => {
        const query = search.toLowerCase();
        return (
          item.base_asset.toLowerCase().includes(query) ||
          item.symbol.toLowerCase().includes(query) ||
          getCoinName(item.base_asset).toLowerCase().includes(query)
        );
      })
    : items;

  const handleRemove = (symbol: string, baseAsset: string) => {
    Alert.alert(
      "Remove from Watchlist",
      `Remove ${getCoinName(baseAsset)} from your watchlist?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeItem(symbol);
            } catch {
              Alert.alert("Error", "Failed to remove from watchlist");
            }
          },
        },
      ],
    );
  };

  const handlePress = (item: WatchlistItem) => {
    router.push({
      pathname: "/(authenticated)/trade",
      params: {
        symbol: item.symbol,
        baseAsset: item.base_asset,
      },
    });
  };

  const renderItem = ({ item }: { item: WatchlistItem }) => {
    const coinName = getCoinName(item.base_asset);

    return (
      <Pressable
        onPress={() => handlePress(item)}
        onLongPress={() => handleRemove(item.symbol, item.base_asset)}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: colors.card },
          pressed && { opacity: 0.7 },
        ]}
      >
        <CoinIcon symbol={item.base_asset} size={44} />
        <View style={styles.rowInfo}>
          <Text style={[styles.coinName, { color: colors.text }]}>{coinName}</Text>
          <Text style={[styles.coinSymbol, { color: colors.secondaryText }]}>{item.base_asset}/USDT</Text>
        </View>
        <View style={styles.rowRight}>
          <Text style={[styles.pricePlaceholder, { color: colors.text }]}>{item.base_asset}/USDT</Text>
          <Text style={styles.changePlaceholder}>+0.00%</Text>
        </View>
      </Pressable>
    );
  };

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
          <Text style={[styles.header, { color: colors.text }]}>Watchlist</Text>
          <Pressable
            onPress={() => router.push("/(authenticated)/(tabs)/explore")}
            style={[styles.addButton, { backgroundColor: colors.buttonPrimary }]}
          >
            <Text style={[styles.addIcon, { color: colors.buttonPrimaryText }]}>+</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputWrapper, { backgroundColor: colors.card }]}>
            <Ionicons name="search" size={18} color={colors.placeholder} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search coins..."
              placeholderTextColor={colors.placeholder}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                Your watchlist is empty. Add tokens from the Explore tab.
              </Text>
            </View>
          }
        />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Outfit",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addIcon: {
    fontSize: 22,
    fontWeight: "500",
    lineHeight: 24,
  },
  searchContainer: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Outfit",
    height: 48,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
  },
  row: {
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
  rowInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  coinName: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Outfit",
  },
  coinSymbol: {
    fontSize: 13,
    fontWeight: "400",
    fontFamily: "Outfit",
  },
  rowRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  pricePlaceholder: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Outfit",
  },
  changePlaceholder: {
    fontSize: 13,
    fontWeight: "500",
    color: "#22C55E",
    fontFamily: "Outfit",
  },
  emptyCard: {
    padding: Spacing.four,
    borderRadius: 16,
    alignItems: "center",
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
