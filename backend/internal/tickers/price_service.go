package tickers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"sync"
	"time"
)

type PriceEntry struct {
	Symbol string  `json:"symbol"`
	Price  float64 `json:"price"`
}

type binancePriceTicker struct {
	Symbol string `json:"symbol"`
	Price  string `json:"price"`
}

type PriceCache struct {
	mu        sync.RWMutex
	prices    map[string]float64
	updatedAt time.Time
	ttl       time.Duration
}

var priceCache = &PriceCache{
	prices: make(map[string]float64),
	ttl:    30 * time.Second,
}

func GetPrice(symbol string) (float64, error) {
	priceCache.mu.RLock()
	if time.Since(priceCache.updatedAt) < priceCache.ttl {
		if price, ok := priceCache.prices[symbol]; ok {
			priceCache.mu.RUnlock()
			return price, nil
		}
	}
	priceCache.mu.RUnlock()

	// Fetch single price
	url := fmt.Sprintf("https://api.binance.com/api/v3/ticker/price?symbol=%s", symbol)
	resp, err := http.Get(url)
	if err != nil {
		return 0, fmt.Errorf("failed to fetch price for %s: %w", symbol, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, fmt.Errorf("failed to read response: %w", err)
	}

	var ticker binancePriceTicker
	if err := json.Unmarshal(body, &ticker); err != nil {
		return 0, fmt.Errorf("failed to parse price: %w", err)
	}

	price, err := strconv.ParseFloat(ticker.Price, 64)
	if err != nil {
		return 0, fmt.Errorf("failed to parse price value: %w", err)
	}

	priceCache.mu.Lock()
	priceCache.prices[symbol] = price
	priceCache.mu.Unlock()

	return price, nil
}

func GetPrices(symbols []string) (map[string]float64, error) {
	priceCache.mu.RLock()
	if time.Since(priceCache.updatedAt) < priceCache.ttl && len(priceCache.prices) > 0 {
		result := make(map[string]float64)
		allFound := true
		for _, s := range symbols {
			if price, ok := priceCache.prices[s]; ok {
				result[s] = price
			} else {
				allFound = false
				break
			}
		}
		if allFound {
			priceCache.mu.RUnlock()
			return result, nil
		}
	}
	priceCache.mu.RUnlock()

	// Fetch all prices and refresh cache
	url := "https://api.binance.com/api/v3/ticker/price"
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch prices: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var tickers []binancePriceTicker
	if err := json.Unmarshal(body, &tickers); err != nil {
		return nil, fmt.Errorf("failed to parse prices: %w", err)
	}

	priceCache.mu.Lock()
	for _, t := range tickers {
		if price, err := strconv.ParseFloat(t.Price, 64); err == nil {
			priceCache.prices[t.Symbol] = price
		}
	}
	priceCache.updatedAt = time.Now()
	priceCache.mu.Unlock()

	result := make(map[string]float64)
	priceCache.mu.RLock()
	for _, s := range symbols {
		if price, ok := priceCache.prices[s]; ok {
			result[s] = price
		}
	}
	priceCache.mu.RUnlock()

	return result, nil
}

func HandleGetPrice(w http.ResponseWriter, r *http.Request) {
	symbol := r.URL.Query().Get("symbol")
	if symbol == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "symbol query parameter is required"})
		return
	}

	price, err := GetPrice(symbol)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch price"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(PriceEntry{Symbol: symbol, Price: price})
}
