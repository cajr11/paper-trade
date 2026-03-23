package trading

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	appcontext "github.com/cajr11/paper-trade/backend/internal/context"
	"github.com/cajr11/paper-trade/backend/internal/store"
	"github.com/cajr11/paper-trade/backend/internal/validator"
)

type TradingHandler struct {
	service      *TradingService
	holdingStore *store.HoldingStore
	tradeStore   *store.TradeStore
	userStore    *store.UserStore
}

func NewTradingHandler(service *TradingService, holdingStore *store.HoldingStore, tradeStore *store.TradeStore, userStore *store.UserStore) *TradingHandler {
	return &TradingHandler{
		service:      service,
		holdingStore: holdingStore,
		tradeStore:   tradeStore,
		userStore:    userStore,
	}
}

func (h *TradingHandler) HandleExecuteTrade(w http.ResponseWriter, r *http.Request) {
	userID := appcontext.GetUserID(r.Context())

	var req TradeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "validation failed", "details": err.Error()})
		return
	}

	trade, err := h.service.ExecuteTrade(r.Context(), userID, req)
	if err != nil {
		switch {
		case errors.Is(err, ErrInsufficientFunds):
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "insufficient funds"})
		case errors.Is(err, ErrInsufficientHoldings):
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "insufficient holdings"})
		case errors.Is(err, ErrInvalidQuantity):
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "quantity must be greater than zero"})
		default:
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "trade execution failed"})
		}
		return
	}

	writeJSON(w, http.StatusCreated, trade)
}

func (h *TradingHandler) HandleGetPortfolio(w http.ResponseWriter, r *http.Request) {
	userID := appcontext.GetUserID(r.Context())

	holdings, err := h.holdingStore.GetByUserID(r.Context(), userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to fetch portfolio"})
		return
	}

	user, err := h.userStore.GetByID(r.Context(), userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to fetch user"})
		return
	}

	if holdings == nil {
		holdings = []store.Holding{}
	}

	response := map[string]interface{}{
		"balance":  user.Balance,
		"holdings": holdings,
	}

	writeJSON(w, http.StatusOK, response)
}

func (h *TradingHandler) HandleGetTradeHistory(w http.ResponseWriter, r *http.Request) {
	userID := appcontext.GetUserID(r.Context())

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	trades, err := h.tradeStore.GetByUserID(r.Context(), userID, limit, offset)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to fetch trade history"})
		return
	}

	if trades == nil {
		trades = []store.Trade{}
	}

	writeJSON(w, http.StatusOK, trades)
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
