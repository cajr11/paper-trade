import { useCallback, useEffect } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import CoinIcon, { getCoinName } from "@/components/ui/CoinIcon";
import ErrorState from "@/components/ui/ErrorState";
import { CardSkeleton, ListSkeleton } from "@/components/ui/Skeleton";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useNotificationStore } from "@/stores/notification-store";
import { usePortfolioStore } from "@/stores/portfolio-store";
import type { Holding } from "@/lib/api";

function formatCurrency(value: number): string {
  return "$" + value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatLargeValue(value: number): string {
  return "$" + Math.floor(value).toLocaleString("en-US");
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    balance,
    holdings,
    livePrices,
    loading,
    refreshing,
    error,
    fetchPortfolio,
    refreshPortfolio,
  } = usePortfolioStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    fetchPortfolio();
    fetchUnreadCount();
  }, [fetchPortfolio, fetchUnreadCount]);

  const onRefresh = useCallback(() => {
    refreshPortfolio();
  }, [refreshPortfolio]);

  // Cost basis: what user paid for holdings
  const totalCostBasis = holdings.reduce(
    (sum, h) => sum + h.quantity * h.avg_buy_price,
    0,
  );

  // Current market value of holdings using live prices
  const holdingsMarketValue = holdings.reduce((sum, h) => {
    const currentPrice = livePrices[h.symbol] ?? h.avg_buy_price;
    return sum + h.quantity * currentPrice;
  }, 0);

  // Total balance = cash + current holdings value
  const totalValue = balance + holdingsMarketValue;

  // Portfolio gain/loss percentage
  const totalInvested = balance + totalCostBasis; // initial capital
  const pnlPercent = totalInvested > 0
    ? ((totalValue - totalInvested) / totalInvested) * 100
    : 0;
  const pnlSign = pnlPercent >= 0 ? "+" : "";

  const handleHoldingPress = (holding: Holding) => {
    router.push({
      pathname: "/(authenticated)/trade",
      params: {
        symbol: holding.symbol,
        baseAsset: holding.base_asset,
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <CardSkeleton />
            <View style={{ marginTop: Spacing.four }}>
              <ListSkeleton count={3} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  if (error && holdings.length === 0) {
    return <ErrorState message={error} onRetry={fetchPortfolio} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Portfolio</Text>
            <Pressable
              style={[styles.bellButton, { backgroundColor: colors.card }]}
              onPress={() => router.push("/(authenticated)/notifications")}
            >
              <View style={styles.bellIconWrapper}>
                <Ionicons name="notifications-outline" size={18} color={colors.icon} />
              </View>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Total Balance */}
          <View style={styles.balanceSection}>
            <Text style={[styles.balanceLabel, { color: colors.secondaryText }]}>Total Balance</Text>
            <Text style={[styles.balanceValue, { color: colors.text }]}>{formatLargeValue(totalValue)}</Text>
            <View style={styles.balanceMetaRow}>
              <Text style={[styles.percentText, { color: pnlPercent >= 0 ? colors.gain : colors.loss }]}>
                {pnlSign}{pnlPercent.toFixed(2)}%
              </Text>
              <Text style={[styles.allTimeText, { color: colors.secondaryText }]}> all time</Text>
            </View>
            <Text style={[styles.cashLine, { color: colors.secondaryText }]}>
              Available Cash {formatCurrency(balance)}
            </Text>
          </View>

          {/* Holdings Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Holdings</Text>
            <Pressable onPress={() => router.push("/(authenticated)/holdings")}>
              <Text style={[styles.seeAll, { color: colors.secondaryText }]}>{"See all \u2192"}</Text>
            </Pressable>
          </View>

          {holdings.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                No holdings yet. Go to Explore to start trading!
              </Text>
            </View>
          ) : (
            holdings.map((holding: Holding) => (
              <HoldingRow
                key={holding.id}
                holding={holding}
                onPress={() => handleHoldingPress(holding)}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function HoldingRow({
  holding,
  onPress,
}: {
  holding: Holding;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const { livePrices } = usePortfolioStore();
  const currentPrice = livePrices[holding.symbol] ?? holding.avg_buy_price;
  const currentValue = holding.quantity * currentPrice;
  const costBasis = holding.quantity * holding.avg_buy_price;
  const changePercent = costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0;
  const changeSign = changePercent >= 0 ? "+" : "";
  const coinName = getCoinName(holding.base_asset);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.holdingRow,
        { backgroundColor: colors.card },
        pressed && { opacity: 0.7 },
      ]}
    >
      <CoinIcon symbol={holding.base_asset} size={44} />
      <View style={styles.holdingInfo}>
        <Text style={[styles.holdingName, { color: colors.text }]}>{coinName}</Text>
        <Text style={[styles.holdingSubtext, { color: colors.secondaryText }]}>
          {holding.quantity.toFixed(holding.quantity < 1 ? 6 : 3)} {holding.base_asset}
        </Text>
      </View>
      <View style={styles.holdingRight}>
        <Text style={[styles.holdingValue, { color: colors.text }]}>{formatCurrency(currentValue)}</Text>
        <Text style={[styles.holdingChange, { color: changePercent >= 0 ? colors.gain : colors.loss }]}>
          {changeSign}{changePercent.toFixed(2)}%
        </Text>
      </View>
    </Pressable>
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

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Outfit",
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bellIconWrapper: {
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "Outfit",
  },

  // Balance
  balanceSection: {
    marginBottom: Spacing.four,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    fontFamily: "Outfit",
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: "700",
    lineHeight: 56,
    fontFamily: "Outfit",
  },
  balanceMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  percentText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Outfit",
  },
  allTimeText: {
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "Outfit",
  },
  cashLine: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
    fontFamily: "Outfit",
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Outfit",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Outfit",
  },

  // Empty
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

  // Holding Rows
  holdingRow: {
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
  holdingInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  holdingName: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Outfit",
  },
  holdingSubtext: {
    fontSize: 13,
    fontWeight: "400",
    fontFamily: "Outfit",
  },
  holdingRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  holdingValue: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Outfit",
  },
  holdingChange: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Outfit",
  },
});
