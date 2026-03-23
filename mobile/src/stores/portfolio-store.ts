import { create } from "zustand";
import { api, type Holding, type Portfolio } from "@/lib/api";

type PortfolioState = {
  balance: number;
  holdings: Holding[];
  loading: boolean;
  refreshing: boolean;
  fetchPortfolio: () => Promise<void>;
  refreshPortfolio: () => Promise<void>;
  clearPortfolio: () => void;
};

export const usePortfolioStore = create<PortfolioState>((set) => ({
  balance: 0,
  holdings: [],
  loading: false,
  refreshing: false,

  fetchPortfolio: async () => {
    set({ loading: true });
    try {
      const data: Portfolio = await api.getPortfolio();
      set({ balance: data.balance, holdings: data.holdings, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  refreshPortfolio: async () => {
    set({ refreshing: true });
    try {
      const data: Portfolio = await api.getPortfolio();
      set({ balance: data.balance, holdings: data.holdings, refreshing: false });
    } catch {
      set({ refreshing: false });
    }
  },

  clearPortfolio: () => set({ balance: 0, holdings: [] }),
}));
