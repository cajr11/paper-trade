import { useCallback, useEffect } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import CoinIcon, { getCoinName } from "@/components/ui/CoinIcon";
import { ThemedText } from "@/components/ui/ThemedText";
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
      <View style={[styles.container, { backgroundColor: "#F5F5F5" }]}>
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
    <View style={[styles.container, { backgroundColor: "#F5F5F5" }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Portfolio Summary */}
          <View style={styles.summarySection}>
            <Text style={styles.totalLabel}>Portfolio Value</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalValue)}</Text>
            <Text style={styles.subtitleRow}>
              Invest: {formatCurrency(totalInvested)}  |  Cash: {formatCurrency(balance)}
            </Text>
          </View>

          {/* Holdings Section */}
          <Text style={styles.sectionTitle}>Holdings</Text>

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
          {holding.quantity.toFixed(6)} {holding.base_asset}
        </Text>
      </View>
      <View style={styles.holdingRight}>
        <Text style={styles.holdingValue}>{formatCurrency(value)}</Text>
      </View>
    </Pressable>
  );
}

// Using RN Text directly for full style control matching the design
import { Text } from "react-native";

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
  summarySection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: Spacing.four,
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#71717A",
    marginBottom: 4,
    fontFamily: "Outfit",
  },
  totalValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#000000",
    lineHeight: 44,
    fontFamily: "Outfit",
  },
  subtitleRow: {
    fontSize: 14,
    fontWeight: "500",
    color: "#71717A",
    marginTop: 8,
    fontFamily: "Outfit",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: Spacing.three,
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
  },
  holdingValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    fontFamily: "Outfit",
  },
});
