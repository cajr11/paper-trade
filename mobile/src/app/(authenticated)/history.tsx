import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CoinIcon, { getCoinName } from "@/components/ui/CoinIcon";
import { Spacing } from "@/constants/theme";
import { useTradeStore } from "@/stores/trade-store";
import type { Trade } from "@/lib/api";

function formatCurrency(value: number): string {
  if (value >= 1) {
    return "$" + value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return "$" + value.toFixed(6);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function History() {
  const { trades, loading, refreshing, fetchTrades, refreshTrades } =
    useTradeStore();

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const onRefresh = useCallback(() => {
    refreshTrades();
  }, [refreshTrades]);

  const renderTrade = ({ item }: { item: Trade }) => {
    const isBuy = item.side === "buy";
    const coinName = getCoinName(item.base_asset);
    const actionText = isBuy ? `Bought ${coinName}` : `Sold ${coinName}`;

    return (
      <View style={styles.row}>
        <CoinIcon symbol={item.base_asset} size={44} />
        <View style={styles.rowInfo}>
          <Text style={styles.actionText}>{actionText}</Text>
          <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={styles.rowRight}>
          <Text style={[styles.amountText, { color: isBuy ? "#22C55E" : "#EF4444" }]}>
            {isBuy ? "+" : "-"}{formatCurrency(item.total)}
          </Text>
          <Text style={styles.qtyText}>
            {item.quantity.toFixed(6)} {item.base_asset}
          </Text>
        </View>
      </View>
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
        <Text style={styles.header}>Transaction History</Text>

        <FlatList
          data={trades}
          renderItem={renderTrade}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No transactions yet. Start trading to see your history.
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
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    fontFamily: "Outfit",
  },
  dateText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#71717A",
    fontFamily: "Outfit",
  },
  rowRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Outfit",
  },
  qtyText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#71717A",
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
