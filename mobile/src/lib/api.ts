import { getStorageItemAsync } from "./secure-store";

const API_BASE_URL = __DEV__
  ? "http://localhost:8080/api/v1"
  : "https://api.paper-trade.app/api/v1";

type RequestOptions = {
  method?: string;
  body?: unknown;
  authenticated?: boolean;
};

class ApiError extends Error {
  status: number;
  data: Record<string, string>;

  constructor(status: number, data: Record<string, string>) {
    super(data.error || "An error occurred");
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, authenticated = false } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authenticated) {
    const token = await getStorageItemAsync("session");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data as T;
}

// Auth
export type AuthResponse = {
  token: string;
  user: UserProfile;
};

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  balance: number;
};

export type Holding = {
  id: string;
  user_id: string;
  symbol: string;
  base_asset: string;
  quantity: number;
  avg_buy_price: number;
  created_at: string;
  updated_at: string;
};

export type Portfolio = {
  balance: number;
  holdings: Holding[];
};

export type Trade = {
  id: string;
  user_id: string;
  symbol: string;
  base_asset: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  total: number;
  created_at: string;
};

export type WatchlistItem = {
  id: string;
  user_id: string;
  symbol: string;
  base_asset: string;
  created_at: string;
};

export type Ticker = {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
  baseAssetIconUrl: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: "order_filled" | "price_alert" | "new_listing" | "system";
  title: string;
  body: string;
  read: boolean;
  created_at: string;
};

export type PriceEntry = {
  symbol: string;
  price: number;
};

export type Ticker24hr = {
  symbol: string;
  priceChangePercent: number;
  lastPrice: number;
  volume: number;
};

// API functions
export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  signup: (fullName: string, email: string, password: string) =>
    request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: { full_name: fullName, email, password },
    }),

  getMe: () =>
    request<UserProfile>("/me", { authenticated: true }),

  // Portfolio
  getPortfolio: () =>
    request<Portfolio>("/portfolio", { authenticated: true }),

  // Trading
  executeTrade: (trade: {
    symbol: string;
    base_asset: string;
    side: "buy" | "sell";
    quantity: number;
    price: number;
  }) =>
    request<Trade>("/trades", {
      method: "POST",
      body: trade,
      authenticated: true,
    }),

  getTradeHistory: (limit = 50, offset = 0) =>
    request<Trade[]>(`/trades?limit=${limit}&offset=${offset}`, {
      authenticated: true,
    }),

  // Watchlist
  getWatchlist: () =>
    request<WatchlistItem[]>("/watchlist", { authenticated: true }),

  addToWatchlist: (symbol: string, baseAsset: string) =>
    request<WatchlistItem>("/watchlist", {
      method: "POST",
      body: { symbol, base_asset: baseAsset },
      authenticated: true,
    }),

  removeFromWatchlist: (symbol: string) =>
    request<{ message: string }>(`/watchlist?symbol=${symbol}`, {
      method: "DELETE",
      authenticated: true,
    }),

  // Tickers
  getTickers: () => request<Ticker[]>("/tickers"),

  getPrice: (symbol: string) =>
    request<PriceEntry>(`/tickers/price?symbol=${symbol}`),

  getPrices: (symbols: string[]) =>
    request<Record<string, number>>(`/tickers/prices?symbols=${symbols.join(",")}`),

  get24hrTickers: () =>
    request<Record<string, Ticker24hr>>("/tickers/24hr"),

  // Notifications
  getNotifications: (limit = 50, offset = 0) =>
    request<Notification[]>(`/notifications?limit=${limit}&offset=${offset}`, {
      authenticated: true,
    }),

  markNotificationRead: (id: string) =>
    request<{ message: string }>(`/notifications/${id}/read`, {
      method: "PATCH",
      authenticated: true,
    }),

  getUnreadCount: () =>
    request<{ count: number }>("/notifications/unread-count", {
      authenticated: true,
    }),
};

export { ApiError };
