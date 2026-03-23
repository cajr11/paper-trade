package store

import (
	"context"
	"database/sql"
	"time"
)

type Notification struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Type      string    `json:"type"`
	Title     string    `json:"title"`
	Body      string    `json:"body"`
	Read      bool      `json:"read"`
	CreatedAt time.Time `json:"created_at"`
}

type NotificationStore struct {
	DB *sql.DB
}

func (s *NotificationStore) Create(ctx context.Context, n *Notification) error {
	query := `
	INSERT INTO notifications (user_id, type, title, body)
	VALUES ($1, $2, $3, $4)
	RETURNING id, read, created_at
	`

	return s.DB.QueryRowContext(ctx, query, n.UserID, n.Type, n.Title, n.Body).Scan(
		&n.ID, &n.Read, &n.CreatedAt,
	)
}

func (s *NotificationStore) CreateTx(ctx context.Context, tx *sql.Tx, n *Notification) error {
	query := `
	INSERT INTO notifications (user_id, type, title, body)
	VALUES ($1, $2, $3, $4)
	RETURNING id, read, created_at
	`

	return tx.QueryRowContext(ctx, query, n.UserID, n.Type, n.Title, n.Body).Scan(
		&n.ID, &n.Read, &n.CreatedAt,
	)
}

func (s *NotificationStore) GetByUserID(ctx context.Context, userID string, limit, offset int) ([]Notification, error) {
	query := `
	SELECT id, user_id, type, title, body, read, created_at
	FROM notifications WHERE user_id = $1
	ORDER BY created_at DESC
	LIMIT $2 OFFSET $3
	`

	rows, err := s.DB.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []Notification
	for rows.Next() {
		var n Notification
		if err := rows.Scan(&n.ID, &n.UserID, &n.Type, &n.Title, &n.Body, &n.Read, &n.CreatedAt); err != nil {
			return nil, err
		}
		notifications = append(notifications, n)
	}

	return notifications, rows.Err()
}

func (s *NotificationStore) MarkAsRead(ctx context.Context, userID, notificationID string) error {
	query := `UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2`
	result, err := s.DB.ExecContext(ctx, query, notificationID, userID)
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

func (s *NotificationStore) GetUnreadCount(ctx context.Context, userID string) (int, error) {
	query := `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = FALSE`
	var count int
	err := s.DB.QueryRowContext(ctx, query, userID).Scan(&count)
	return count, err
}
