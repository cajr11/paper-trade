import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import CoinIcon, { getCoinName } from "@/components/ui/CoinIcon";
import { Spacing } from "@/constants/theme";
import { api, ApiError, type PriceEntry } from "@/lib/api";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useTradeStore } from "@/stores/trade-store";
import { useWatchlistStore } from "@/stores/watchlist-store";

type Side = "buy" | "sell";
type ScreenView = "detail" | "order";

const TIME_PERIODS = ["1D", "1W", "1M", "1Y"] as const;

export default function Trade() {
  const router = useRouter();
  const { symbol, baseAsset } = useLocalSearchParams<{
    symbol: string;
    baseAsset: string;
  }>();

  const { balance, fetchPortfolio } = usePortfolioStore();
  const { fetchTrades } = useTradeStore();
  const { isWatched, addItem, removeItem, fetchWatchlist } = useWatchlistStore();

  const [price, setPrice] = useState<PriceEntry | null>(null);
  const watched = symbol ? isWatched(symbol) : false;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [side, setSide] = useState<Side>("buy");
  const [amountUsd, setAmountUsd] = useState("");
  const [activeTimePeriod, setActiveTimePeriod] = useState<string>("1D");
  const [view, setView] = useState<ScreenView>("detail");

  const coinName = baseAsset ? getCoinName(baseAsset) : "";

  const fetchPrice = useCallback(async () => {
    if (!symbol) return;
    try {
      const data = await api.getPrice(symbol);
      setPrice(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchPrice();
    fetchWatchlist();
    fetchPortfolio();
    const interval = setInterval(fetchPrice, 10000);
    return () => clearInterval(interval);
  }, [fetchPrice, fetchWatchlist, fetchPortfolio]);

  const parsedAmount = parseFloat(amountUsd || "0");
  const quantity = price && parsedAmount > 0 ? parsedAmount / price.price : 0;

  const handleTrade = async () => {
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (!price || !symbol || !baseAsset) return;

    setSubmitting(true);
    try {
      await api.executeTrade({
        symbol,
        base_asset: baseAsset,
        side,
        quantity,
        price: price.price,
      });
      fetchPortfolio();
      fetchTrades();
      Alert.alert(
        "Trade Executed",
        `Successfully ${side === "buy" ? "bought" : "sold"} ${quantity.toFixed(6)} ${baseAsset}`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error) {
      if (error instanceof ApiError) {
        Alert.alert("Trade Failed", error.message);
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (value: number): string => {
    if (value >= 1) {
      return "$" + value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return "$" + value.toFixed(6);
  };

  const handleWatchlistToggle = async () => {
    if (!symbol || !baseAsset) return;
    try {
      if (watched) {
        await removeItem(symbol);
      } else {
        await addItem(symbol, baseAsset);
      }
    } catch {
      Alert.alert("Error", "Failed to update watchlist");
    }
  };

  const openOrder = (orderSide: Side) => {
    setSide(orderSide);
    setView("order");
  };

  const QUICK_AMOUNTS = [100, 500, 1000];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  // --- ORDER VIEW ---
  if (view === "order") {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Back */}
              <Pressable onPress={() => setView("detail")} style={styles.backButton}>
                <Text style={styles.backText}>{"\u2190"} Back</Text>
              </Pressable>

              {/* Title */}
              <Text style={styles.orderTitle}>
                {side === "buy" ? "Buy" : "Sell"} {coinName}
              </Text>

              <Text style={styles.currentPriceLabel}>
                Current price: {price ? formatPrice(price.price) : "--"}
              </Text>

              {/* Amount Input */}
              <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>Amount (USD)</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="$0.00"
                  placeholderTextColor="#A0A0A0"
                  value={amountUsd ? `$${amountUsd}` : ""}
                  onChangeText={(text) => setAmountUsd(text.replace(/[^0-9.]/g, ""))}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Quick Amount Pills */}
              <View style={styles.quickAmounts}>
                {QUICK_AMOUNTS.map((amount) => {
                  const isActive = parsedAmount === amount;
                  return (
                    <Pressable
                      key={amount}
                      onPress={() => setAmountUsd(String(amount))}
                      style={[
                        styles.quickPill,
                        isActive ? styles.quickPillActive : styles.quickPillInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.quickPillText,
                          { color: isActive ? "#FFFFFF" : "#71717A" },
                        ]}
                      >
                        ${amount.toLocaleString()}
                      </Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  onPress={() => setAmountUsd(String(Math.floor(balance)))}
                  style={[
                    styles.quickPill,
                    parsedAmount === Math.floor(balance)
                      ? styles.quickPillActive
                      : styles.quickPillInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.quickPillText,
                      {
                        color:
                          parsedAmount === Math.floor(balance) ? "#FFFFFF" : "#71717A",
                      },
                    ]}
                  >
                    Max
                  </Text>
                </Pressable>
              </View>

              {/* You'll receive */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>You'll receive</Text>
                <Text style={styles.infoValue}>
                  {quantity > 0 ? quantity.toFixed(6) : "0.00000"} {baseAsset}
                </Text>
              </View>

              {/* Available balance */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Available balance</Text>
                <Text style={styles.infoValue}>{formatPrice(balance)}</Text>
              </View>

              {/* Confirm Button */}
              <View style={{ marginTop: Spacing.four }}>
                {submitting ? (
                  <ActivityIndicator
                    size="large"
                    style={{ height: 52 }}
                    color="#000000"
                  />
                ) : (
                  <Pressable
                    onPress={handleTrade}
                    style={({ pressed }) => [
                      styles.confirmButton,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={styles.confirmText}>
                      Confirm {side === "buy" ? "Purchase" : "Sale"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
  }

  // --- COIN DETAIL VIEW ---
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>{"\u2190"} Back</Text>
            </Pressable>
            <Pressable onPress={handleWatchlistToggle} style={styles.watchlistButton}>
              <Text style={styles.watchlistIcon}>
                {watched ? "\u2605" : "\u2606"}
              </Text>
            </Pressable>
          </View>

          {/* Coin Header */}
          <View style={styles.coinHeader}>
            <CoinIcon symbol={baseAsset ?? ""} size={56} />
            <View style={styles.coinHeaderText}>
              <Text style={styles.coinName}>{coinName}</Text>
              <Text style={styles.coinSymbol}>{baseAsset}/USDT</Text>
            </View>
          </View>

          {/* Price */}
          <Text style={styles.priceValue}>
            {price ? formatPrice(price.price) : "--"}
          </Text>
          <Text style={styles.priceChange}>+2.4% today</Text>

          {/* Chart Placeholder */}
          <View style={styles.chartArea}>
            <View style={styles.chartGreenFill} />
            <View style={styles.chartLineGreen} />
          </View>

          {/* Time Period Pills */}
          <View style={styles.timePeriods}>
            {TIME_PERIODS.map((period) => (
              <Pressable
                key={period}
                onPress={() => setActiveTimePeriod(period)}
                style={[
                  styles.timePill,
                  activeTimePeriod === period
                    ? styles.timePillActive
                    : styles.timePillInactive,
                ]}
              >
                <Text
                  style={[
                    styles.timePillText,
                    {
                      color: activeTimePeriod === period ? "#FFFFFF" : "#71717A",
                    },
                  ]}
                >
                  {period}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>24h High</Text>
              <Text style={styles.statValue}>
                {price ? formatPrice(price.price * 1.02) : "--"}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>24h Low</Text>
              <Text style={styles.statValue}>
                {price ? formatPrice(price.price * 0.98) : "--"}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Volume</Text>
              <Text style={styles.statValue}>$1.2B</Text>
            </View>
          </View>

          {/* Buy / Sell Buttons */}
          <View style={styles.actionButtons}>
            <Pressable
              onPress={() => openOrder("buy")}
              style={({ pressed }) => [
                styles.actionButton,
                styles.buyButton,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.actionButtonText}>Buy {baseAsset}</Text>
            </Pressable>
            <Pressable
              onPress={() => openOrder("sell")}
              style={({ pressed }) => [
                styles.actionButton,
                styles.sellButton,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.actionButtonText}>Sell {baseAsset}</Text>
            </Pressable>
          </View>
        </ScrollView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
  },

  // Top Bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.two,
  },
  backButton: {
    paddingVertical: Spacing.two,
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    fontFamily: "Outfit",
  },
  watchlistButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  watchlistIcon: {
    fontSize: 22,
    color: "#F7931A",
  },

  // Coin Header
  coinHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.four,
    marginBottom: Spacing.three,
  },
  coinHeaderText: {
    marginLeft: 12,
  },
  coinName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
    fontFamily: "Outfit",
  },
  coinSymbol: {
    fontSize: 14,
    fontWeight: "400",
    color: "#71717A",
    marginTop: 2,
    fontFamily: "Outfit",
  },

  // Price
  priceValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#000000",
    lineHeight: 44,
    fontFamily: "Outfit",
  },
  priceChange: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22C55E",
    marginTop: 4,
    marginBottom: Spacing.four,
    fontFamily: "Outfit",
  },

  // Chart
  chartArea: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    height: 180,
    marginBottom: Spacing.three,
    overflow: "hidden",
    justifyContent: "flex-end",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartGreenFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "rgba(34, 197, 94, 0.08)",
  },
  chartLineGreen: {
    position: "absolute",
    bottom: "40%",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#22C55E",
  },

  // Time Periods
  timePeriods: {
    flexDirection: "row",
    gap: 8,
    marginBottom: Spacing.four,
  },
  timePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timePillActive: {
    backgroundColor: "#000000",
  },
  timePillInactive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  timePillText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Outfit",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: Spacing.four,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F3",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "400",
    color: "#71717A",
    marginBottom: 4,
    fontFamily: "Outfit",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    fontFamily: "Outfit",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buyButton: {
    backgroundColor: "#000000",
  },
  sellButton: {
    backgroundColor: "#000000",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Outfit",
  },

  // --- ORDER VIEW STYLES ---
  orderTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginTop: Spacing.three,
    marginBottom: 4,
    fontFamily: "Outfit",
  },
  currentPriceLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: "#71717A",
    marginBottom: Spacing.four,
    fontFamily: "Outfit",
  },
  amountSection: {
    marginBottom: Spacing.three,
  },
  amountLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
    marginBottom: Spacing.two,
    fontFamily: "Outfit",
  },
  amountInput: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 24,
    fontWeight: "600",
    backgroundColor: "#FFFFFF",
    color: "#000000",
    fontFamily: "Outfit",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickAmounts: {
    flexDirection: "row",
    gap: 8,
    marginBottom: Spacing.four,
  },
  quickPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickPillActive: {
    backgroundColor: "#000000",
  },
  quickPillInactive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickPillText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Outfit",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F3",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: "#71717A",
    fontFamily: "Outfit",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    fontFamily: "Outfit",
  },
  confirmButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Outfit",
  },
});
