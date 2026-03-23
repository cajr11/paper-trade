import { useCallback, useEffect } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import ErrorState from "@/components/ui/ErrorState";
import { CardSkeleton, ListSkeleton } from "@/components/ui/Skeleton";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { usePortfolioStore } from "@/stores/portfolio-store";
import type { Holding } from "@/lib/api";

function formatCurrency(value: number): string {
  return "$" + value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const {
    balance,
    holdings,
    loading,
    refreshing,
    error,
    fetchPortfolio,
    refreshPortfolio,
  } = usePortfolioStore();

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const onRefresh = useCallback(() => {
    refreshPortfolio();
  }, [refreshPortfolio]);

  const totalInvested = holdings.reduce(
    (sum, h) => sum + h.quantity * h.avg_buy_price,
    0,
  );

  const totalValue = balance + totalInvested;

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <ThemedText type="subtitle" style={styles.header}>
              Dashboard
            </ThemedText>
            <CardSkeleton />
            <View style={{ marginTop: Spacing.four }}>
              <ListSkeleton count={3} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (error && holdings.length === 0) {
    return <ErrorState message={error} onRetry={fetchPortfolio} />;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <ThemedText type="subtitle" style={styles.header}>
            Dashboard
          </ThemedText>

          {/* Portfolio Summary Card */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary">
              Total Portfolio Value
            </ThemedText>
            <ThemedText type="title" style={styles.totalValue}>
              {formatCurrency(totalValue)}
            </ThemedText>

            <View style={styles.balanceRow}>
              <View style={styles.balanceItem}>
                <ThemedText type="small" themeColor="textSecondary">
                  Cash Available
                </ThemedText>
                <ThemedText type="default">
                  {formatCurrency(balance)}
                </ThemedText>
              </View>
              <View style={styles.balanceItem}>
                <ThemedText type="small" themeColor="textSecondary">
                  Invested
                </ThemedText>
                <ThemedText type="default">
                  {formatCurrency(totalInvested)}
                </ThemedText>
              </View>
            </View>
          </ThemedView>

          {/* Holdings */}
          <ThemedText type="default" style={styles.sectionTitle}>
            Holdings
          </ThemedText>

          {holdings.length === 0 ? (
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
                No holdings yet. Go to Explore to start trading!
              </ThemedText>
            </ThemedView>
          ) : (
            holdings.map((holding: Holding) => (
              <HoldingRow key={holding.id} holding={holding} colors={colors} />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function HoldingRow({
  holding,
  colors,
}: {
  holding: Holding;
  colors: Record<string, string>;
}) {
  const value = holding.quantity * holding.avg_buy_price;

  return (
    <View
      style={[styles.holdingRow, { backgroundColor: colors.backgroundElement }]}
    >
      <View style={styles.holdingLeft}>
        <ThemedText type="default" style={styles.holdingSymbol}>
          {holding.base_asset}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {holding.quantity.toFixed(6)} @ {formatCurrency(holding.avg_buy_price)}
        </ThemedText>
      </View>
      <View style={styles.holdingRight}>
        <ThemedText type="default">{formatCurrency(value)}</ThemedText>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
  },
  header: {
    marginBottom: Spacing.four,
    marginTop: Spacing.three,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  totalValue: {
    fontSize: 36,
    lineHeight: 44,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.two,
  },
  balanceItem: {
    gap: 4,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: Spacing.two,
  },
  emptyCard: {
    padding: Spacing.four,
    borderRadius: 16,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
  },
  holdingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.three,
    borderRadius: 12,
    marginBottom: Spacing.two,
  },
  holdingLeft: {
    gap: 4,
  },
  holdingRight: {
    alignItems: "flex-end",
  },
  holdingSymbol: {
    fontWeight: "700",
  },
});
