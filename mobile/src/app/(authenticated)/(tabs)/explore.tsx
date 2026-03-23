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

import CoinIcon, { getCoinName } from "@/components/ui/CoinIcon";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { Spacing } from "@/constants/theme";
import { api, type Ticker } from "@/lib/api";

type FilterOption = "All" | "Top Gainers" | "Top Losers" | "New";
const FILTERS: FilterOption[] = ["All", "Top Gainers", "Top Losers", "New"];

export default function Explore() {
  const router = useRouter();
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [filtered, setFiltered] = useState<Ticker[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All");
  const [loading, setLoading] = useState(true);

  const fetchTickers = useCallback(async () => {
    try {
      const data = await api.getTickers();
      setTickers(data);
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

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.baseAsset.toLowerCase().includes(query) ||
          t.symbol.toLowerCase().includes(query) ||
          getCoinName(t.baseAsset).toLowerCase().includes(query),
      );
    }

    setFiltered(result);
  }, [search, tickers, activeFilter]);

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

    return (
      <Pressable
        onPress={() => handleTickerPress(item)}
        style={({ pressed }) => [
          styles.tickerRow,
          pressed && { opacity: 0.7 },
        ]}
      >
        <CoinIcon symbol={item.baseAsset} size={44} iconUrl={item.baseAssetIconUrl} />
        <View style={styles.tickerInfo}>
          <Text style={styles.tickerName}>{coinName}</Text>
          <Text style={styles.tickerSymbol}>{item.baseAsset}/USDT</Text>
        </View>
        <View style={styles.tickerRight}>
          <Text style={styles.tickerPair}>{item.baseAsset}/USDT</Text>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.header}>Explore</Text>
          <View style={styles.listContent}>
            <ListSkeleton count={8} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.header}>Explore</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Text style={styles.searchIcon}>&#128269;</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search coins..."
              placeholderTextColor="#A0A0A0"
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
                  ? styles.filterPillActive
                  : styles.filterPillInactive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: activeFilter === filter ? "#FFFFFF" : "#71717A",
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
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No tokens found</Text>
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
    backgroundColor: "#F5F5F5",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
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
    backgroundColor: "#FFFFFF",
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
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
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
  filterPillActive: {
    backgroundColor: "#000000",
  },
  filterPillInactive: {
    backgroundColor: "#FFFFFF",
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
  tickerInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  tickerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    fontFamily: "Outfit",
  },
  tickerSymbol: {
    fontSize: 13,
    fontWeight: "400",
    color: "#71717A",
    fontFamily: "Outfit",
  },
  tickerRight: {
    alignItems: "flex-end",
  },
  tickerPair: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
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
    fontSize: 14,
    color: "#71717A",
    fontFamily: "Outfit",
  },
});
