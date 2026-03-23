package store

import (
	"database/sql"
)

type Storage struct {
	DB        *sql.DB
	User      *UserStore
	Holding   *HoldingStore
	Trade     *TradeStore
	Watchlist *WatchlistStore
}

func NewStorage(db *sql.DB) Storage {
	return Storage{
		DB:        db,
		User:      &UserStore{DB: db},
		Holding:   &HoldingStore{DB: db},
		Trade:     &TradeStore{DB: db},
		Watchlist: &WatchlistStore{DB: db},
	}
}
