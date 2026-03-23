import { create } from "zustand";
import { api, type Holding, type Portfolio } from "@/lib/api";

type PortfolioState = {
  balance: number;
  holdings: Holding[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  fetchPortfolio: () => Promise<void>;
  refreshPortfolio: () => Promise<void>;
  clearPortfolio: () => void;
};

export const usePortfolioStore = create<PortfolioState>((set) => ({
  balance: 0,
  holdings: [],
  loading: false,
  refreshing: false,
  error: null,

  fetchPortfolio: async () => {
    set({ loading: true, error: null });
    try {
      const data: Portfolio = await api.getPortfolio();
      set({ balance: data.balance, holdings: data.holdings, loading: false });
    } catch {
      set({ loading: false, error: "Failed to load portfolio" });
    }
  },

  refreshPortfolio: async () => {
    set({ refreshing: true, error: null });
    try {
      const data: Portfolio = await api.getPortfolio();
      set({ balance: data.balance, holdings: data.holdings, refreshing: false });
    } catch {
      set({ refreshing: false, error: "Failed to refresh portfolio" });
    }
  },

  clearPortfolio: () => set({ balance: 0, holdings: [], error: null }),
}));
