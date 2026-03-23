package trading

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/cajr11/paper-trade/backend/internal/store"
)

var (
	ErrInsufficientFunds    = errors.New("insufficient funds")
	ErrInsufficientHoldings = errors.New("insufficient holdings")
	ErrInvalidQuantity      = errors.New("quantity must be greater than zero")
	ErrInvalidPrice         = errors.New("price must be greater than zero")
)

type TradeRequest struct {
	Symbol    string  `json:"symbol" validate:"required"`
	BaseAsset string  `json:"base_asset" validate:"required"`
	Side      string  `json:"side" validate:"required,oneof=buy sell"`
	Quantity  float64 `json:"quantity" validate:"required,gt=0"`
	Price     float64 `json:"price" validate:"required,gt=0"`
}

type TradingService struct {
	db                *sql.DB
	userStore         *store.UserStore
	holdingStore      *store.HoldingStore
	tradeStore        *store.TradeStore
	notificationStore *store.NotificationStore
}

func NewTradingService(db *sql.DB, userStore *store.UserStore, holdingStore *store.HoldingStore, tradeStore *store.TradeStore, notificationStore *store.NotificationStore) *TradingService {
	return &TradingService{
		db:                db,
		userStore:         userStore,
		holdingStore:      holdingStore,
		tradeStore:        tradeStore,
		notificationStore: notificationStore,
	}
}

func (s *TradingService) ExecuteTrade(ctx context.Context, userID string, req TradeRequest) (*store.Trade, error) {
	if req.Quantity <= 0 {
		return nil, ErrInvalidQuantity
	}
	if req.Price <= 0 {
		return nil, ErrInvalidPrice
	}

	total := req.Quantity * req.Price

	// Start transaction
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Get current user for balance check
	user, err := s.userStore.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	if req.Side == "buy" {
		if err := s.executeBuy(ctx, tx, user, req, total); err != nil {
			return nil, err
		}
	} else {
		if err := s.executeSell(ctx, tx, user, req, total); err != nil {
			return nil, err
		}
	}

	// Record the trade
	trade := &store.Trade{
		UserID:    userID,
		Symbol:    req.Symbol,
		BaseAsset: req.BaseAsset,
		Side:      req.Side,
		Quantity:  req.Quantity,
		Price:     req.Price,
		Total:     total,
	}

	if err := s.tradeStore.Create(ctx, tx, trade); err != nil {
		return nil, fmt.Errorf("failed to record trade: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return trade, nil
}

func (s *TradingService) executeBuy(ctx context.Context, tx *sql.Tx, user *store.User, req TradeRequest, total float64) error {
	if user.Balance < total {
		return ErrInsufficientFunds
	}

	// Update user balance
	newBalance := user.Balance - total
	if err := s.userStore.UpdateBalance(ctx, tx, user.ID, newBalance); err != nil {
		return fmt.Errorf("failed to update balance: %w", err)
	}

	// Get or create holding
	holding, err := s.holdingStore.GetByUserAndSymbol(ctx, user.ID, req.Symbol)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return fmt.Errorf("failed to get holding: %w", err)
	}

	if holding == nil {
		holding = &store.Holding{
			UserID:      user.ID,
			Symbol:      req.Symbol,
			BaseAsset:   req.BaseAsset,
			Quantity:    req.Quantity,
			AvgBuyPrice: req.Price,
		}
	} else {
		// Calculate new average buy price
		totalCost := (holding.Quantity * holding.AvgBuyPrice) + (req.Quantity * req.Price)
		newQuantity := holding.Quantity + req.Quantity
		holding.Quantity = newQuantity
		holding.AvgBuyPrice = totalCost / newQuantity
	}

	if err := s.holdingStore.Upsert(ctx, tx, holding); err != nil {
		return fmt.Errorf("failed to update holding: %w", err)
	}

	return nil
}

func (s *TradingService) executeSell(ctx context.Context, tx *sql.Tx, user *store.User, req TradeRequest, total float64) error {
	holding, err := s.holdingStore.GetByUserAndSymbol(ctx, user.ID, req.Symbol)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrInsufficientHoldings
		}
		return fmt.Errorf("failed to get holding: %w", err)
	}

	if holding.Quantity < req.Quantity {
		return ErrInsufficientHoldings
	}

	// Update user balance
	newBalance := user.Balance + total
	if err := s.userStore.UpdateBalance(ctx, tx, user.ID, newBalance); err != nil {
		return fmt.Errorf("failed to update balance: %w", err)
	}

	// Update holding
	holding.Quantity -= req.Quantity
	if err := s.holdingStore.Upsert(ctx, tx, holding); err != nil {
		return fmt.Errorf("failed to update holding: %w", err)
	}

	return nil
}
