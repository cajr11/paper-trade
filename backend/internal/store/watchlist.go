package store

import (
	"context"
	"database/sql"
	"time"
)

type WatchlistItem struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Symbol    string    `json:"symbol"`
	BaseAsset string    `json:"base_asset"`
	CreatedAt time.Time `json:"created_at"`
}

type WatchlistStore struct {
	DB *sql.DB
}

func (s *WatchlistStore) GetByUserID(ctx context.Context, userID string) ([]WatchlistItem, error) {
	query := `
	SELECT id, user_id, symbol, base_asset, created_at
	FROM watchlist WHERE user_id = $1
	ORDER BY created_at DESC
	`

	rows, err := s.DB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []WatchlistItem
	for rows.Next() {
		var item WatchlistItem
		if err := rows.Scan(&item.ID, &item.UserID, &item.Symbol, &item.BaseAsset, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, rows.Err()
}

func (s *WatchlistStore) Add(ctx context.Context, item *WatchlistItem) error {
	query := `
	INSERT INTO watchlist (user_id, symbol, base_asset)
	VALUES ($1, $2, $3)
	ON CONFLICT (user_id, symbol) DO NOTHING
	RETURNING id, created_at
	`

	return s.DB.QueryRowContext(ctx, query, item.UserID, item.Symbol, item.BaseAsset).Scan(
		&item.ID, &item.CreatedAt,
	)
}

func (s *WatchlistStore) Remove(ctx context.Context, userID, symbol string) error {
	query := `DELETE FROM watchlist WHERE user_id = $1 AND symbol = $2`
	result, err := s.DB.ExecContext(ctx, query, userID, symbol)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (s *WatchlistStore) Exists(ctx context.Context, userID, symbol string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM watchlist WHERE user_id = $1 AND symbol = $2)`
	var exists bool
	err := s.DB.QueryRowContext(ctx, query, userID, symbol).Scan(&exists)
	return exists, err
}
