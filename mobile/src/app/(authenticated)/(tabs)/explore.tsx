import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import CoinIcon, { getCoinName } from "@/components/ui/CoinIcon";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { api, type Ticker, type Ticker24hr } from "@/lib/api";

type FilterOption = "All" | "Top Gainers" | "Top Losers" | "New";
const FILTERS: FilterOption[] = ["All", "Top Gainers", "Top Losers", "New"];

export default function Explore() {
  const router = useRouter();
  const { colors } = useTheme();
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [tickerData, setTickerData] = useState<Record<string, Ticker24hr>>({});
  const [filtered, setFiltered] = useState<Ticker[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All");
  const [loading, setLoading] = useState(true);

  const fetchTickers = useCallback(async () => {
    try {
      const [data, data24hr] = await Promise.all([
        api.getTickers(),
        api.get24hrTickers(),
      ]);
      setTickers(data);
      setTickerData(data24hr);
      setFiltered(data);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickers();
  }, [fetchTickers]);

  useEffect(() => {
    let result = tickers;

    // Apply search filter
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.baseAsset.toLowerCase().includes(query) ||
          t.symbol.toLowerCase().includes(query) ||
          getCoinName(t.baseAsset).toLowerCase().includes(query),
      );
    }

    // Apply category filter
    if (activeFilter === "Top Gainers") {
      result = result
        .filter((t) => {
          const data = tickerData[t.symbol];
          return data && data.priceChangePercent > 0;
        })
        .sort((a, b) => {
          const aChange = tickerData[a.symbol]?.priceChangePercent ?? 0;
          const bChange = tickerData[b.symbol]?.priceChangePercent ?? 0;
          return bChange - aChange;
        });
    } else if (activeFilter === "Top Losers") {
      result = result
        .filter((t) => {
          const data = tickerData[t.symbol];
          return data && data.priceChangePercent < 0;
        })
        .sort((a, b) => {
          const aChange = tickerData[a.symbol]?.priceChangePercent ?? 0;
          const bChange = tickerData[b.symbol]?.priceChangePercent ?? 0;
          return aChange - bChange;
        });
    } else if (activeFilter === "New") {
      // Sort by lowest volume as a proxy for newer/less established tokens
      result = [...result].sort((a, b) => {
        const aVol = tickerData[a.symbol]?.volume ?? Infinity;
        const bVol = tickerData[b.symbol]?.volume ?? Infinity;
        return aVol - bVol;
      });
    }

    setFiltered(result);
  }, [search, tickers, activeFilter, tickerData]);

  const handleTickerPress = (ticker: Ticker) => {
    router.push({
      pathname: "/(authenticated)/trade",
      params: {
        symbol: ticker.symbol,
        baseAsset: ticker.baseAsset,
      },
    });
  };

  const renderTicker = ({ item }: { item: Ticker }) => {
    const coinName = getCoinName(item.baseAsset);
    const data = tickerData[item.symbol];
    const changePercent = data?.priceChangePercent ?? 0;
    const lastPrice = data?.lastPrice;
    const changeSign = changePercent >= 0 ? "+" : "";
    const changeColor = changePercent >= 0 ? colors.gain : colors.loss;

    return (
      <Pressable
        onPress={() => handleTickerPress(item)}
        style={({ pressed }) => [
          styles.tickerRow,
          { backgroundColor: colors.card },
          pressed && { opacity: 0.7 },
        ]}
      >
        <CoinIcon symbol={item.baseAsset} size={44} iconUrl={item.baseAssetIconUrl} />
        <View style={styles.tickerInfo}>
          <Text style={[styles.tickerName, { color: colors.text }]}>{coinName}</Text>
          <Text style={[styles.tickerSymbol, { color: colors.secondaryText }]}>{item.baseAsset}/USDT</Text>
        </View>
        <View style={styles.tickerRight}>
          {lastPrice != null ? (
            <>
              <Text style={[styles.tickerPrice, { color: colors.text }]}>
                ${lastPrice >= 1 ? lastPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : lastPrice.toFixed(6)}
              </Text>
              <Text style={[styles.tickerChange, { color: changeColor }]}>
                {changeSign}{changePercent.toFixed(2)}%
              </Text>
            </>
          ) : (
            <Text style={[styles.tickerPrice, { color: colors.text }]}>{item.baseAsset}/USDT</Text>
          )}
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={[styles.header, { color: colors.text }]}>Explore</Text>
          <View style={styles.listContent}>
            <ListSkeleton count={8} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={[styles.header, { color: colors.text }]}>Explore</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputWrapper, { backgroundColor: colors.card }]}>
            <Ionicons name="search" size={18} color={colors.placeholder} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search coins..."
              placeholderTextColor={colors.placeholder}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

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
                  {
                    color: activeFilter === filter ? colors.pillActiveText : colors.secondaryText,
                  },
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Ticker List */}
        <FlatList
          data={filtered}
          renderItem={renderTicker}
          keyExtractor={(item) => item.symbol}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>No tokens found</Text>
            </View>
          }
        />
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
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: Spacing.three,
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four,
    fontFamily: "Outfit",
  },
  searchContainer: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Outfit",
    height: 48,
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
  tickerRow: {
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
  tickerInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  tickerName: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Outfit",
  },
  tickerSymbol: {
    fontSize: 13,
    fontWeight: "400",
    fontFamily: "Outfit",
  },
  tickerRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  tickerPrice: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Outfit",
  },
  tickerChange: {
    fontSize: 13,
    fontWeight: "500",
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
    fontSize: 14,
    fontFamily: "Outfit",
  },
});
