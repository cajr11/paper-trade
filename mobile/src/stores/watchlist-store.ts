import { create } from "zustand";
import { api, type WatchlistItem } from "@/lib/api";

type WatchlistState = {
  items: WatchlistItem[];
  loading: boolean;
  refreshing: boolean;
  fetchWatchlist: () => Promise<void>;
  refreshWatchlist: () => Promise<void>;
  addItem: (symbol: string, baseAsset: string) => Promise<void>;
  removeItem: (symbol: string) => Promise<void>;
  isWatched: (symbol: string) => boolean;
  clearWatchlist: () => void;
};

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  items: [],
  loading: false,
  refreshing: false,

  fetchWatchlist: async () => {
    set({ loading: true });
    try {
      const items = await api.getWatchlist();
      set({ items, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  refreshWatchlist: async () => {
    set({ refreshing: true });
    try {
      const items = await api.getWatchlist();
      set({ items, refreshing: false });
    } catch {
      set({ refreshing: false });
    }
  },

  addItem: async (symbol: string, baseAsset: string) => {
    try {
      const item = await api.addToWatchlist(symbol, baseAsset);
      set({ items: [item, ...get().items] });
    } catch {
      throw new Error("Failed to add to watchlist");
    }
  },

  removeItem: async (symbol: string) => {
    try {
      await api.removeFromWatchlist(symbol);
      set({ items: get().items.filter((i) => i.symbol !== symbol) });
    } catch {
      throw new Error("Failed to remove from watchlist");
    }
  },

  isWatched: (symbol: string) => {
    return get().items.some((i) => i.symbol === symbol);
  },

  clearWatchlist: () => set({ items: [] }),
}));
