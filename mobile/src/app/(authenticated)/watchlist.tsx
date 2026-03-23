import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import CoinIcon, { getCoinName } from "@/components/ui/CoinIcon";
import { Spacing } from "@/constants/theme";
import { useWatchlistStore } from "@/stores/watchlist-store";
import type { WatchlistItem } from "@/lib/api";

export default function Watchlist() {
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
        style={({ pressed }) => [
          styles.row,
          pressed && { opacity: 0.7 },
        ]}
      >
        <CoinIcon symbol={item.base_asset} size={44} />
        <View style={styles.rowInfo}>
          <Text style={styles.coinName}>{coinName}</Text>
          <Text style={styles.coinSymbol}>{item.base_asset}/USDT</Text>
        </View>
        <Pressable
          onPress={() => handleRemove(item.symbol, item.base_asset)}
          hitSlop={8}
          style={styles.removeButton}
        >
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      </Pressable>
    );
  };

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
        <Text style={styles.header}>Watchlist</Text>

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
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
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
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: Spacing.three,
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four,
    fontFamily: "Outfit",
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
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
    color: "#000000",
    fontFamily: "Outfit",
  },
  coinSymbol: {
    fontSize: 13,
    fontWeight: "400",
    color: "#71717A",
    fontFamily: "Outfit",
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
  },
  removeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#EF4444",
    fontFamily: "Outfit",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
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
    color: "#71717A",
    fontFamily: "Outfit",
  },
});
