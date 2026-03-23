package store

import (
	"database/sql"
)

type Storage struct {
	User    *UserStore
	Holding *HoldingStore
}

func NewStorage(db *sql.DB) Storage {
	return Storage{
		User:    &UserStore{DB: db},
		Holding: &HoldingStore{DB: db},
	}
}
