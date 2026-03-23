import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useWatchlistStore } from "@/stores/watchlist-store";
import type { WatchlistItem } from "@/lib/api";

export default function Watchlist() {
  const { colors } = useTheme();
  const router = useRouter();
  const { items, loading, refreshing, fetchWatchlist, refreshWatchlist, removeItem } =
    useWatchlistStore();

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const onRefresh = useCallback(() => {
    refreshWatchlist();
  }, [refreshWatchlist]);

  const handleRemove = (symbol: string, baseAsset: string) => {
    Alert.alert(
      "Remove from Watchlist",
      `Remove ${baseAsset} from your watchlist?`,
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

  const renderItem = ({ item }: { item: WatchlistItem }) => (
    <Pressable
      onPress={() => handlePress(item)}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.backgroundElement },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.rowLeft}>
        <ThemedText type="default" style={styles.symbol}>
          {item.base_asset}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {item.symbol}
        </ThemedText>
      </View>
      <Pressable
        onPress={() => handleRemove(item.symbol, item.base_asset)}
        hitSlop={8}
      >
        <ThemedText type="small" themeColor="secondaryText">
          Remove
        </ThemedText>
      </Pressable>
    </Pressable>
  );

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
        <ThemedText type="subtitle" style={styles.header}>
          Watchlist
        </ThemedText>

        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.emptyText}
              >
                Your watchlist is empty. Add tokens from the Explore tab.
              </ThemedText>
            </ThemedView>
          }
        />
      </SafeAreaView>
    </ThemedView>
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
  header: {
    marginBottom: Spacing.three,
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.three,
    borderRadius: 12,
    marginBottom: Spacing.two,
  },
  rowLeft: {
    gap: 2,
  },
  symbol: {
    fontWeight: "700",
  },
  emptyCard: {
    padding: Spacing.four,
    borderRadius: 16,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
  },
});
