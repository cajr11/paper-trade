import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import CustomButton from "@/components/ui/CustomButton";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { api, ApiError, type PriceEntry } from "@/lib/api";

type Side = "buy" | "sell";

export default function Trade() {
  const { colors } = useTheme();
  const router = useRouter();
  const { symbol, baseAsset } = useLocalSearchParams<{
    symbol: string;
    baseAsset: string;
  }>();

  const [price, setPrice] = useState<PriceEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [side, setSide] = useState<Side>("buy");
  const [quantity, setQuantity] = useState("");

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
    const interval = setInterval(fetchPrice, 10000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

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
              <ThemedText type="default">Back</ThemedText>
            </Pressable>

            {/* Coin Header */}
            <View style={styles.coinHeader}>
              <ThemedText type="subtitle" style={styles.coinName}>
                {baseAsset}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {symbol}
              </ThemedText>
            </View>

            {/* Price Display */}
            <ThemedView type="backgroundElement" style={styles.priceCard}>
              <ThemedText type="small" themeColor="textSecondary">
                Current Price
              </ThemedText>
              <ThemedText type="title" style={styles.priceValue}>
                {price ? formatPrice(price.price) : "--"}
              </ThemedText>
            </ThemedView>

            {/* Buy / Sell Toggle */}
            <View style={styles.toggleContainer}>
              <Pressable
                onPress={() => setSide("buy")}
                style={[
                  styles.toggleButton,
                  {
                    backgroundColor:
                      side === "buy" ? "#22C55E" : colors.backgroundElement,
                  },
                ]}
              >
                <ThemedText
                  type="default"
                  style={[
                    styles.toggleText,
                    { color: side === "buy" ? "#ffffff" : colors.text },
                  ]}
                >
                  Buy
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setSide("sell")}
                style={[
                  styles.toggleButton,
                  {
                    backgroundColor:
                      side === "sell" ? "#EF4444" : colors.backgroundElement,
                  },
                ]}
              >
                <ThemedText
                  type="default"
                  style={[
                    styles.toggleText,
                    { color: side === "sell" ? "#ffffff" : colors.text },
                  ]}
                >
                  Sell
                </ThemedText>
              </Pressable>
            </View>

            {/* Quantity Input */}
            <View style={styles.inputSection}>
              <ThemedText type="default" style={styles.inputLabel}>
                Quantity
              </ThemedText>
              <TextInput
                style={[
                  styles.quantityInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.backgroundElement,
                  },
                ]}
                placeholder="0.00"
                placeholderTextColor={colors.secondaryText}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Total */}
            <ThemedView type="backgroundElement" style={styles.totalCard}>
              <View style={styles.totalRow}>
                <ThemedText type="small" themeColor="textSecondary">
                  Estimated Total
                </ThemedText>
                <ThemedText type="default" style={styles.totalValue}>
                  {formatPrice(total)}
                </ThemedText>
              </View>
            </ThemedView>

            {/* Submit */}
            {submitting ? (
              <ActivityIndicator size="large" style={{ height: 52 }} />
            ) : (
              <CustomButton
                label={`${side === "buy" ? "Buy" : "Sell"} ${baseAsset}`}
                onPress={handleTrade}
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
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
  coinHeader: {
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
  },
  coinName: {
    marginBottom: 4,
  },
  priceCard: {
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  priceValue: {
    fontSize: 36,
    lineHeight: 44,
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
  toggleText: {
    fontWeight: "700",
  },
  inputSection: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  inputLabel: {
    fontWeight: "700",
  },
  quantityInput: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 18,
  },
  totalCard: {
    padding: Spacing.three,
    borderRadius: 12,
    marginBottom: Spacing.four,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalValue: {
    fontWeight: "700",
  },
});
