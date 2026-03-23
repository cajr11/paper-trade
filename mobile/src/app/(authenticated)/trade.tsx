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

export default function Trade() {
  const router = useRouter();
  const { symbol, baseAsset } = useLocalSearchParams<{
    symbol: string;
    baseAsset: string;
  }>();

  const { fetchPortfolio } = usePortfolioStore();
  const { fetchTrades } = useTradeStore();
  const { isWatched, addItem, removeItem, fetchWatchlist } = useWatchlistStore();

  const [price, setPrice] = useState<PriceEntry | null>(null);
  const watched = symbol ? isWatched(symbol) : false;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [side, setSide] = useState<Side>("buy");
  const [quantity, setQuantity] = useState("");

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
    const interval = setInterval(fetchPrice, 10000);
    return () => clearInterval(interval);
  }, [fetchPrice, fetchWatchlist]);

  const total = price && quantity ? price.price * parseFloat(quantity || "0") : 0;

  const handleTrade = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      Alert.alert("Error", "Please enter a valid quantity");
      return;
    }
    if (!price || !symbol || !baseAsset) return;

    setSubmitting(true);
    try {
      await api.executeTrade({
        symbol,
        base_asset: baseAsset,
        side,
        quantity: parseFloat(quantity),
        price: price.price,
      });
      fetchPortfolio();
      fetchTrades();
      Alert.alert(
        "Trade Executed",
        `Successfully ${side === "buy" ? "bought" : "sold"} ${quantity} ${baseAsset}`,
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Back Button */}
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>

            {/* Coin Header with Icon */}
            <View style={styles.coinHeader}>
              <View style={styles.coinHeaderLeft}>
                <CoinIcon symbol={baseAsset ?? ""} size={48} />
                <View style={styles.coinHeaderText}>
                  <Text style={styles.coinName}>{coinName}</Text>
                  <Text style={styles.coinSymbol}>{baseAsset}</Text>
                </View>
              </View>
              <Pressable
                onPress={handleWatchlistToggle}
                style={styles.watchlistButton}
              >
                <Text style={styles.watchlistIcon}>
                  {watched ? "\u2605" : "\u2606"}
                </Text>
              </Pressable>
            </View>

            {/* Price Display */}
            <View style={styles.priceSection}>
              <Text style={styles.priceValue}>
                {price ? formatPrice(price.price) : "--"}
              </Text>
              <Text style={styles.priceLabel}>Current Price</Text>
            </View>

            {/* Chart Placeholder */}
            <View style={styles.chartPlaceholder}>
              <View style={styles.chartLine} />
              <Text style={styles.chartLabel}>Price chart coming soon</Text>
            </View>

            {/* Buy / Sell Toggle */}
            <View style={styles.toggleContainer}>
              <Pressable
                onPress={() => setSide("buy")}
                style={[
                  styles.toggleButton,
                  side === "buy" ? styles.toggleBuyActive : styles.toggleInactive,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: side === "buy" ? "#FFFFFF" : "#71717A" },
                  ]}
                >
                  Buy {baseAsset}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSide("sell")}
                style={[
                  styles.toggleButton,
                  side === "sell" ? styles.toggleSellActive : styles.toggleInactive,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: side === "sell" ? "#FFFFFF" : "#71717A" },
                  ]}
                >
                  Sell {baseAsset}
                </Text>
              </Pressable>
            </View>

            {/* Quantity Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Quantity</Text>
              <TextInput
                style={styles.quantityInput}
                placeholder="0.00"
                placeholderTextColor="#A0A0A0"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Estimated Total */}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Estimated Total</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>

            {/* Submit Button */}
            {submitting ? (
              <ActivityIndicator size="large" style={{ height: 52 }} color="#000000" />
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
          </ScrollView>
        </KeyboardAvoidingView>
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
  backButton: {
    paddingVertical: Spacing.two,
    marginTop: Spacing.two,
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    fontFamily: "Outfit",
  },
  coinHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
  },
  coinHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
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
  priceSection: {
    marginBottom: Spacing.four,
  },
  priceValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#000000",
    lineHeight: 44,
    fontFamily: "Outfit",
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#71717A",
    marginTop: 4,
    fontFamily: "Outfit",
  },
  chartPlaceholder: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  chartLine: {
    position: "absolute",
    top: "50%",
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: "#E0E0E0",
    borderRadius: 1,
  },
  chartLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#A0A0A0",
    fontFamily: "Outfit",
  },
  toggleContainer: {
    flexDirection: "row",
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  toggleButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleBuyActive: {
    backgroundColor: "#22C55E",
  },
  toggleSellActive: {
    backgroundColor: "#EF4444",
  },
  toggleInactive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Outfit",
  },
  inputSection: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
    fontFamily: "Outfit",
  },
  quantityInput: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 18,
    backgroundColor: "#FFFFFF",
    color: "#000000",
    fontFamily: "Outfit",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  totalCard: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.three,
    borderRadius: 12,
    marginBottom: Spacing.four,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#71717A",
    fontFamily: "Outfit",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
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
