package store

import (
	"context"
	"database/sql"
	"time"
)

type Trade struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Symbol    string    `json:"symbol"`
	BaseAsset string    `json:"base_asset"`
	Side      string    `json:"side"`
	Quantity  float64   `json:"quantity"`
	Price     float64   `json:"price"`
	Total     float64   `json:"total"`
	CreatedAt time.Time `json:"created_at"`
}

type TradeStore struct {
	DB *sql.DB
}

func (s *TradeStore) Create(ctx context.Context, tx *sql.Tx, trade *Trade) error {
	query := `
	INSERT INTO trades (user_id, symbol, base_asset, side, quantity, price, total)
	VALUES ($1, $2, $3, $4, $5, $6, $7)
	RETURNING id, created_at
	`

	return tx.QueryRowContext(ctx, query,
		trade.UserID, trade.Symbol, trade.BaseAsset, trade.Side,
		trade.Quantity, trade.Price, trade.Total,
	).Scan(&trade.ID, &trade.CreatedAt)
}

func (s *TradeStore) GetByUserID(ctx context.Context, userID string, limit, offset int) ([]Trade, error) {
	query := `
	SELECT id, user_id, symbol, base_asset, side, quantity, price, total, created_at
	FROM trades WHERE user_id = $1
	ORDER BY created_at DESC
	LIMIT $2 OFFSET $3
	`

	rows, err := s.DB.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var trades []Trade
	for rows.Next() {
		var t Trade
		if err := rows.Scan(&t.ID, &t.UserID, &t.Symbol, &t.BaseAsset, &t.Side, &t.Quantity, &t.Price, &t.Total, &t.CreatedAt); err != nil {
			return nil, err
		}
		trades = append(trades, t)
	}

	return trades, rows.Err()
}
