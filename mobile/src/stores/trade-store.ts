import { create } from "zustand";
import { api, type Trade } from "@/lib/api";

type TradeState = {
  trades: Trade[];
  loading: boolean;
  refreshing: boolean;
  fetchTrades: (limit?: number, offset?: number) => Promise<void>;
  refreshTrades: () => Promise<void>;
  clearTrades: () => void;
};

export const useTradeStore = create<TradeState>((set) => ({
  trades: [],
  loading: false,
  refreshing: false,

  fetchTrades: async (limit = 50, offset = 0) => {
    set({ loading: true });
    try {
      const trades = await api.getTradeHistory(limit, offset);
      set({ trades, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  refreshTrades: async () => {
    set({ refreshing: true });
    try {
      const trades = await api.getTradeHistory(50, 0);
      set({ trades, refreshing: false });
    } catch {
      set({ refreshing: false });
    }
  },

  clearTrades: () => set({ trades: [] }),
}));
