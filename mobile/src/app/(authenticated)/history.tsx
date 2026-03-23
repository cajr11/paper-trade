import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
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
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function History() {
  const { colors } = useTheme();
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

    return (
      <View
        style={[styles.row, { backgroundColor: colors.backgroundElement }]}
      >
        <View style={styles.rowTop}>
          <View style={styles.rowLeft}>
            <ThemedText type="default" style={styles.symbol}>
              {item.base_asset}
            </ThemedText>
            <View
              style={[
                styles.sideBadge,
                { backgroundColor: isBuy ? "#22C55E20" : "#EF444420" },
              ]}
            >
              <ThemedText
                type="small"
                style={{ color: isBuy ? "#22C55E" : "#EF4444", fontWeight: "600" }}
              >
                {item.side.toUpperCase()}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="default" style={styles.total}>
            {formatCurrency(item.total)}
          </ThemedText>
        </View>
        <View style={styles.rowBottom}>
          <ThemedText type="small" themeColor="textSecondary">
            {item.quantity.toFixed(6)} @ {formatCurrency(item.price)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formatDate(item.created_at)}
          </ThemedText>
        </View>
      </View>
    );
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
        <ThemedText type="subtitle" style={styles.header}>
          Transaction History
        </ThemedText>

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
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.emptyText}
              >
                No transactions yet. Start trading to see your history.
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
    padding: Spacing.three,
    borderRadius: 12,
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  symbol: {
    fontWeight: "700",
  },
  sideBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 6,
  },
  total: {
    fontWeight: "700",
  },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
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
