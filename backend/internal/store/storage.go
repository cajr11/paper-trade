package store

import (
	"context"
	"database/sql"
)

type UserStoreInterface interface {
	Create(context.Context, *User) error
	GetByEmail(ctx context.Context, email string) (*User, error)
	GetByID(ctx context.Context, id string) (*User, error)
}

type Storage struct {
	User *UserStore
}

func NewStorage(db *sql.DB) Storage {
	return Storage{
		User: &UserStore{DB: db},
	}
}
