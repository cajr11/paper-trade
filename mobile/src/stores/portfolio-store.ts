import { create } from "zustand";
import { api, type Holding, type Portfolio } from "@/lib/api";

type PortfolioState = {
  balance: number;
  holdings: Holding[];
  livePrices: Record<string, number>;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  fetchPortfolio: () => Promise<void>;
  refreshPortfolio: () => Promise<void>;
  fetchLivePrices: () => Promise<void>;
  clearPortfolio: () => void;
};

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  balance: 0,
  holdings: [],
  livePrices: {},
  loading: false,
  refreshing: false,
  error: null,

  fetchPortfolio: async () => {
    set({ loading: true, error: null });
    try {
      const data: Portfolio = await api.getPortfolio();
      set({ balance: data.balance, holdings: data.holdings, loading: false });
      // Fetch live prices after getting holdings
      if (data.holdings.length > 0) {
        get().fetchLivePrices();
      }
    } catch {
      set({ loading: false, error: "Failed to load portfolio" });
    }
  },

  refreshPortfolio: async () => {
    set({ refreshing: true, error: null });
    try {
      const data: Portfolio = await api.getPortfolio();
      set({ balance: data.balance, holdings: data.holdings, refreshing: false });
      if (data.holdings.length > 0) {
        get().fetchLivePrices();
      }
    } catch {
      set({ refreshing: false, error: "Failed to refresh portfolio" });
    }
  },

  fetchLivePrices: async () => {
    const { holdings } = get();
    if (holdings.length === 0) return;

    const symbols = holdings.map((h) => h.symbol);
    try {
      const prices = await api.getPrices(symbols);
      set({ livePrices: prices });
    } catch {
      // Keep existing prices on failure
    }
  },

  clearPortfolio: () => set({ balance: 0, holdings: [], livePrices: {}, error: null }),
}));
