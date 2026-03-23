import React, { useCallback, useEffect, useMemo, useState } from "react";
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

import { getCoinName } from "@/components/ui/CoinIcon";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useTradeStore } from "@/stores/trade-store";
import type { Trade } from "@/lib/api";

type FilterOption = "All" | "Buys" | "Sells";
const FILTERS: FilterOption[] = ["All", "Buys", "Sells"];

function formatCurrency(value: number): string {
  if (value >= 1) {
    return "$" + value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return "$" + value.toFixed(6);
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getDateGroup(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const tradeDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (tradeDate.getTime() === today.getTime()) return "Today";
  if (tradeDate.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type GroupedTrades = { title: string; data: Trade[] }[];

export default function History() {
  const { colors } = useTheme();
  const { trades, loading, refreshing, fetchTrades, refreshTrades } =
    useTradeStore();
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All");

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const onRefresh = useCallback(() => {
    refreshTrades();
  }, [refreshTrades]);

  const filteredTrades = useMemo(() => {
    if (activeFilter === "All") return trades;
    if (activeFilter === "Buys") return trades.filter((t) => t.side === "buy");
    return trades.filter((t) => t.side === "sell");
  }, [trades, activeFilter]);

  const grouped: GroupedTrades = useMemo(() => {
    const groups: Record<string, Trade[]> = {};
    for (const trade of filteredTrades) {
      const key = getDateGroup(trade.created_at);
      if (!groups[key]) groups[key] = [];
      groups[key].push(trade);
    }
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [filteredTrades]);

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
        <Text style={[styles.header, { color: colors.text }]}>History</Text>

        {/* Filter Pills */}
        <View style={styles.filterContainer}>
          {FILTERS.map((filter) => (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterPill,
                activeFilter === filter
                  ? { backgroundColor: colors.pillActive }
                  : [styles.filterPillInactive, { backgroundColor: colors.pillInactive }],
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: activeFilter === filter ? colors.pillActiveText : colors.secondaryText },
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredTrades.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                No transactions yet. Start trading to see your history.
              </Text>
            </View>
          ) : (
            grouped.map((group) => (
              <View key={group.title}>
                <Text style={[styles.dateGroupTitle, { color: colors.secondaryText }]}>{group.title}</Text>
                {group.data.map((trade) => (
                  <TradeRow key={trade.id} trade={trade} />
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function TradeRow({ trade }: { trade: Trade }) {
  const { colors } = useTheme();
  const isBuy = trade.side === "buy";
  const coinName = getCoinName(trade.base_asset);
  const actionText = isBuy ? `Bought ${coinName}` : `Sold ${coinName}`;
  const arrowColor = isBuy ? colors.gain : colors.loss;

  return (
    <View style={[styles.row, { backgroundColor: colors.card }]}>
      {/* Arrow icon */}
      <View style={[styles.arrowCircle, { backgroundColor: isBuy ? "#ECFDF5" : "#FEF2F2" }]}>
        <Text style={[styles.arrowIcon, { color: arrowColor }]}>
          {isBuy ? "\u2193" : "\u2191"}
        </Text>
      </View>

      <View style={styles.rowInfo}>
        <Text style={[styles.actionText, { color: colors.text }]}>{actionText}</Text>
        <Text style={[styles.detailText, { color: colors.secondaryText }]}>
          {formatTime(trade.created_at)} {"\u00B7"} {trade.quantity.toFixed(trade.quantity < 1 ? 6 : 3)} {trade.base_asset}
        </Text>
      </View>

      <View style={styles.rowRight}>
        <Text style={[styles.amountText, { color: arrowColor }]}>
          {isBuy ? "-" : "+"}{formatCurrency(trade.total)}
        </Text>
      </View>
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
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: Spacing.three,
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four,
    fontFamily: "Outfit",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterPillInactive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Outfit",
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
  },
  dateGroupTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.two,
    marginTop: Spacing.two,
    fontFamily: "Outfit",
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
  arrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: "700",
  },
  rowInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Outfit",
  },
  detailText: {
    fontSize: 13,
    fontWeight: "400",
    fontFamily: "Outfit",
  },
  rowRight: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "600",
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
