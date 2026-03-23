import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import CoinIcon, { getCoinName } from "@/components/ui/CoinIcon";
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

export default function HoldingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { holdings, livePrices } = usePortfolioStore();

  const handleHoldingPress = (holding: Holding) => {
    router.push({
      pathname: "/(authenticated)/trade",
      params: {
        symbol: holding.symbol,
        baseAsset: holding.base_asset,
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.text }]}>{"\u2190"} Back</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Holdings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {holdings.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                No holdings yet. Go to Explore to start trading!
              </Text>
            </View>
          ) : (
            holdings.map((holding: Holding) => {
              const currentPrice = livePrices[holding.symbol] ?? holding.avg_buy_price;
              const currentValue = holding.quantity * currentPrice;
              const costBasis = holding.quantity * holding.avg_buy_price;
              const pnl = currentValue - costBasis;
              const changePercent = costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0;
              const changeSign = changePercent >= 0 ? "+" : "";
              const coinName = getCoinName(holding.base_asset);

              return (
                <Pressable
                  key={holding.id}
                  onPress={() => handleHoldingPress(holding)}
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
                    <Text style={[styles.holdingValue, { color: colors.text }]}>
                      {formatCurrency(currentValue)}
                    </Text>
                    <Text
                      style={[
                        styles.holdingPnl,
                        { color: pnl >= 0 ? colors.gain : colors.loss },
                      ]}
                    >
                      {changeSign}{changePercent.toFixed(2)}% ({pnl >= 0 ? "+" : ""}{formatCurrency(Math.abs(pnl))})
                    </Text>
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  backButton: {
    paddingVertical: Spacing.two,
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Outfit",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Outfit",
  },
  headerSpacer: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
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
  holdingPnl: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Outfit",
  },
});
