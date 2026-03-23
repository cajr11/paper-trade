import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { useTheme } from "@/hooks/useTheme";

const BINANCE_KLINES_URL = "https://api.binance.com/api/v3/klines";

type KlineData = number[]; // [openTime, open, high, low, close, volume, ...]

type TimePeriod = "1D" | "1W" | "1M" | "1Y";

const PERIOD_CONFIG: Record<TimePeriod, { interval: string; limit: number }> = {
  "1D": { interval: "1h", limit: 24 },
  "1W": { interval: "4h", limit: 42 },
  "1M": { interval: "1d", limit: 30 },
  "1Y": { interval: "1w", limit: 52 },
};

type PriceChartProps = {
  symbol: string;
  period: TimePeriod;
  width: number;
  height: number;
};

export default function PriceChart({ symbol, period, width, height }: PriceChartProps) {
  const { colors } = useTheme();
  const [prices, setPrices] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKlines = useCallback(async () => {
    const config = PERIOD_CONFIG[period];
    if (!config || !symbol) return;

    setLoading(true);
    try {
      const url = `${BINANCE_KLINES_URL}?symbol=${symbol}&interval=${config.interval}&limit=${config.limit}`;
      const response = await fetch(url);
      const data: KlineData[] = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        // Extract close prices (index 4)
        const closePrices = data.map((k) => parseFloat(String(k[4])));
        setPrices(closePrices);
      }
    } catch {
      // Keep existing data on error
    } finally {
      setLoading(false);
    }
  }, [symbol, period]);

  useEffect(() => {
    fetchKlines();
  }, [fetchKlines]);

  if (loading && prices.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <ActivityIndicator size="small" color={colors.secondaryText} />
      </View>
    );
  }

  if (prices.length < 2) {
    return <View style={[styles.container, { width, height }]} />;
  }

  const isPositive = prices[prices.length - 1] >= prices[0];
  const lineColor = isPositive ? "#22C55E" : "#EF4444";
  const fillColor = isPositive ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.08)";

  const padding = { top: 16, bottom: 8, left: 0, right: 0 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const points = prices.map((p, i) => ({
    x: padding.left + (i / (prices.length - 1)) * chartWidth,
    y: padding.top + (1 - (p - minPrice) / priceRange) * chartHeight,
  }));

  // Build the line path
  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    linePath += ` L ${points[i].x} ${points[i].y}`;
  }

  // Build the fill path (line + close to bottom)
  const fillPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={lineColor} stopOpacity="0.15" />
            <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d={fillPath} fill="url(#fillGradient)" />
        <Path d={linePath} fill="none" stroke={lineColor} strokeWidth={2} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
