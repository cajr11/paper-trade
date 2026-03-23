package store

import (
	"context"
	"database/sql"
	"time"
)

type Holding struct {
	ID          string  `json:"id"`
	UserID      string  `json:"user_id"`
	Symbol      string  `json:"symbol"`
	BaseAsset   string  `json:"base_asset"`
	Quantity    float64 `json:"quantity"`
	AvgBuyPrice float64 `json:"avg_buy_price"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type HoldingStore struct {
	DB *sql.DB
}

func (s *HoldingStore) GetByUserID(ctx context.Context, userID string) ([]Holding, error) {
	query := `
	SELECT id, user_id, symbol, base_asset, quantity, avg_buy_price, created_at, updated_at
	FROM holdings WHERE user_id = $1 AND quantity > 0
	ORDER BY updated_at DESC
	`

	rows, err := s.DB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var holdings []Holding
	for rows.Next() {
		var h Holding
		if err := rows.Scan(&h.ID, &h.UserID, &h.Symbol, &h.BaseAsset, &h.Quantity, &h.AvgBuyPrice, &h.CreatedAt, &h.UpdatedAt); err != nil {
			return nil, err
		}
		holdings = append(holdings, h)
	}

	return holdings, rows.Err()
}

func (s *HoldingStore) GetByUserAndSymbol(ctx context.Context, userID, symbol string) (*Holding, error) {
	query := `
	SELECT id, user_id, symbol, base_asset, quantity, avg_buy_price, created_at, updated_at
	FROM holdings WHERE user_id = $1 AND symbol = $2
	`

	h := &Holding{}
	err := s.DB.QueryRowContext(ctx, query, userID, symbol).Scan(
		&h.ID, &h.UserID, &h.Symbol, &h.BaseAsset, &h.Quantity, &h.AvgBuyPrice, &h.CreatedAt, &h.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return h, nil
}

func (s *HoldingStore) Upsert(ctx context.Context, tx *sql.Tx, h *Holding) error {
	query := `
	INSERT INTO holdings (user_id, symbol, base_asset, quantity, avg_buy_price)
	VALUES ($1, $2, $3, $4, $5)
	ON CONFLICT (user_id, symbol) DO UPDATE SET
		quantity = $4,
		avg_buy_price = $5,
		updated_at = NOW()
	RETURNING id, created_at, updated_at
	`

	return tx.QueryRowContext(ctx, query, h.UserID, h.Symbol, h.BaseAsset, h.Quantity, h.AvgBuyPrice).Scan(
		&h.ID, &h.CreatedAt, &h.UpdatedAt,
	)
}
