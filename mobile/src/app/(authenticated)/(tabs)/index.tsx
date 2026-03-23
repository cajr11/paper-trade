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
      <View style={styles.container}>
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
    <View style={styles.container}>
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
            <Text style={styles.headerTitle}>Portfolio</Text>
            <Pressable style={styles.bellButton}>
              <View style={styles.bellIconWrapper}>
                <Ionicons name="notifications-outline" size={18} color="#000000" />
              </View>
            </Pressable>
          </View>

          {/* Total Balance */}
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceValue}>{formatLargeValue(totalValue)}</Text>
            <View style={styles.balanceMetaRow}>
              <Text style={styles.percentText}>+4.32%</Text>
              <Text style={styles.allTimeText}> all time</Text>
            </View>
            <Text style={styles.cashLine}>
              Available Cash {formatCurrency(balance)}
            </Text>
          </View>

          {/* Holdings Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Holdings</Text>
            <Pressable>
              <Text style={styles.seeAll}>{"See all \u2192"}</Text>
            </Pressable>
          </View>

          {holdings.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
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
  const value = holding.quantity * holding.avg_buy_price;
  const coinName = getCoinName(holding.base_asset);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.holdingRow,
        pressed && { opacity: 0.7 },
      ]}
    >
      <CoinIcon symbol={holding.base_asset} size={44} />
      <View style={styles.holdingInfo}>
        <Text style={styles.holdingName}>{coinName}</Text>
        <Text style={styles.holdingSubtext}>
          {holding.quantity.toFixed(holding.quantity < 1 ? 6 : 3)} {holding.base_asset}
        </Text>
      </View>
      <View style={styles.holdingRight}>
        <Text style={styles.holdingValue}>{formatCurrency(value)}</Text>
        <Text style={styles.holdingChange}>+2.4%</Text>
      </View>
    </Pressable>
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
    color: "#000000",
    fontFamily: "Outfit",
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
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

  // Balance
  balanceSection: {
    marginBottom: Spacing.four,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#71717A",
    marginBottom: 4,
    fontFamily: "Outfit",
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: "700",
    color: "#000000",
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
    color: "#22C55E",
    fontFamily: "Outfit",
  },
  allTimeText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#71717A",
    fontFamily: "Outfit",
  },
  cashLine: {
    fontSize: 14,
    fontWeight: "500",
    color: "#71717A",
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
    color: "#000000",
    fontFamily: "Outfit",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "500",
    color: "#71717A",
    fontFamily: "Outfit",
  },

  // Empty
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

  // Holding Rows
  holdingRow: {
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
  holdingInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  holdingName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    fontFamily: "Outfit",
  },
  holdingSubtext: {
    fontSize: 13,
    fontWeight: "400",
    color: "#71717A",
    fontFamily: "Outfit",
  },
  holdingRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  holdingValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    fontFamily: "Outfit",
  },
  holdingChange: {
    fontSize: 13,
    fontWeight: "500",
    color: "#22C55E",
    fontFamily: "Outfit",
  },
});
