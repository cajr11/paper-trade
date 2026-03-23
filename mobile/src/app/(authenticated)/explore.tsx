import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { api, type Ticker } from "@/lib/api";

export default function Explore() {
  const { colors } = useTheme();
  const router = useRouter();
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [filtered, setFiltered] = useState<Ticker[]>([]);
  const [search, setSearch] = useState("");
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
    if (!search.trim()) {
      setFiltered(tickers);
      return;
    }
    const query = search.toLowerCase();
    setFiltered(
      tickers.filter(
        (t) =>
          t.baseAsset.toLowerCase().includes(query) ||
          t.symbol.toLowerCase().includes(query),
      ),
    );
  }, [search, tickers]);

  const handleTickerPress = (ticker: Ticker) => {
    router.push({
      pathname: "/(authenticated)/trade",
      params: {
        symbol: ticker.symbol,
        baseAsset: ticker.baseAsset,
      },
    });
  };

  const renderTicker = ({ item }: { item: Ticker }) => (
    <Pressable
      onPress={() => handleTickerPress(item)}
      style={({ pressed }) => [
        styles.tickerRow,
        { backgroundColor: colors.backgroundElement },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.tickerInfo}>
        <ThemedText type="default" style={styles.tickerSymbol}>
          {item.baseAsset}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {item.symbol}
        </ThemedText>
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        USDT
      </ThemedText>
    </Pressable>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="subtitle" style={styles.header}>
            Explore
          </ThemedText>
          <View style={styles.listContent}>
            <ListSkeleton count={8} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle" style={styles.header}>
          Explore
        </ThemedText>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {
                color: colors.text,
                backgroundColor: colors.backgroundElement,
              },
            ]}
            placeholder="Search tokens..."
            placeholderTextColor={colors.secondaryText}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Ticker List */}
        <FlatList
          data={filtered}
          renderItem={renderTicker}
          keyExtractor={(item) => item.symbol}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <ThemedText type="small" themeColor="textSecondary">
                No tokens found
              </ThemedText>
            </ThemedView>
          }
        />
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
  header: {
    marginBottom: Spacing.three,
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  searchContainer: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  searchInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
  },
  tickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.three,
    borderRadius: 12,
    marginBottom: Spacing.two,
  },
  tickerInfo: {
    gap: 2,
  },
  tickerSymbol: {
    fontWeight: "700",
  },
  emptyCard: {
    padding: Spacing.four,
    borderRadius: 16,
    alignItems: "center",
  },
});
