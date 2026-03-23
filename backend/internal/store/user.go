package store

import (
	"context"
	"database/sql"
	"time"
)

type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	FullName     string    `json:"full_name"`
	PasswordHash string    `json:"-"`
	Balance      float64   `json:"balance"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type UserStore struct {
	DB *sql.DB
}

func (s *UserStore) Create(ctx context.Context, user *User) error {
	query := `
	INSERT INTO users (email, full_name, password_hash)
	VALUES ($1, $2, $3) RETURNING id, balance, created_at, updated_at
	`

	err := s.DB.QueryRowContext(ctx, query, user.Email, user.FullName, user.PasswordHash).Scan(
		&user.ID, &user.Balance, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return err
	}

	return nil
}

func (s *UserStore) GetByEmail(ctx context.Context, email string) (*User, error) {
	query := `
	SELECT id, email, full_name, password_hash, balance, created_at, updated_at
	FROM users WHERE email = $1
	`

	user := &User{}
	err := s.DB.QueryRowContext(ctx, query, email).Scan(
		&user.ID, &user.Email, &user.FullName, &user.PasswordHash,
		&user.Balance, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserStore) GetByID(ctx context.Context, id string) (*User, error) {
	query := `
	SELECT id, email, full_name, password_hash, balance, created_at, updated_at
	FROM users WHERE id = $1
	`

	user := &User{}
	err := s.DB.QueryRowContext(ctx, query, id).Scan(
		&user.ID, &user.Email, &user.FullName, &user.PasswordHash,
		&user.Balance, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return user, nil
}
