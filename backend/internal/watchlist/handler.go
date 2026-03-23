package watchlist

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"

	appMiddleware "github.com/cajr11/paper-trade/backend/internal/middleware"
	"github.com/cajr11/paper-trade/backend/internal/store"
)

type WatchlistHandler struct {
	store *store.WatchlistStore
}

func NewWatchlistHandler(store *store.WatchlistStore) *WatchlistHandler {
	return &WatchlistHandler{store: store}
}

type AddRequest struct {
	Symbol    string `json:"symbol" validate:"required"`
	BaseAsset string `json:"base_asset" validate:"required"`
}

func (h *WatchlistHandler) HandleGetWatchlist(w http.ResponseWriter, r *http.Request) {
	userID := appMiddleware.GetUserID(r.Context())

	items, err := h.store.GetByUserID(r.Context(), userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to fetch watchlist"})
		return
	}

	if items == nil {
		items = []store.WatchlistItem{}
	}

	writeJSON(w, http.StatusOK, items)
}

func (h *WatchlistHandler) HandleAddToWatchlist(w http.ResponseWriter, r *http.Request) {
	userID := appMiddleware.GetUserID(r.Context())

	var req AddRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	item := &store.WatchlistItem{
		UserID:    userID,
		Symbol:    req.Symbol,
		BaseAsset: req.BaseAsset,
	}

	if err := h.store.Add(r.Context(), item); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to add to watchlist"})
		return
	}

	writeJSON(w, http.StatusCreated, item)
}

func (h *WatchlistHandler) HandleRemoveFromWatchlist(w http.ResponseWriter, r *http.Request) {
	userID := appMiddleware.GetUserID(r.Context())
	symbol := r.URL.Query().Get("symbol")

	if symbol == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "symbol is required"})
		return
	}

	if err := h.store.Remove(r.Context(), userID, symbol); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "symbol not in watchlist"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to remove from watchlist"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "removed from watchlist"})
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
