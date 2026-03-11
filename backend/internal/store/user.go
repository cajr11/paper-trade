package store

import (
	"context"
	"database/sql"

	"time"
)

type User struct {
	ID string
	Email string
	FullName string
	PasswordHash string `json:"-"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

type UserStore struct{
	db *sql.DB
}

func (s *UserStore) Create(ctx context.Context, user *User) error {

	query := `
	INSERT INTO users (email, full_name, password_hash)
	VALUES ($1, $2, $3) RETURNING id, created_at, updated_at
	`

	err := s.db.QueryRowContext(ctx, query, user.Email, user.FullName, user.PasswordHash).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return err
	 }

	 return nil

}