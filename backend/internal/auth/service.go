package auth

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/cajr11/paper-trade/backend/internal/store"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailTaken         = errors.New("email already registered")
)

type AuthService struct {
	userStore *store.UserStore
}

func NewAuthService(userStore *store.UserStore) *AuthService {
	return &AuthService{userStore: userStore}
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return string(bytes), nil
}

func CheckPassword(hash, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func (s *AuthService) CreateUser(ctx context.Context, req SignupRequest) (*store.User, error) {
	// Check if user already exists
	_, err := s.userStore.GetByEmail(ctx, req.Email)
	if err == nil {
		return nil, ErrEmailTaken
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return nil, fmt.Errorf("failed to check existing user: %w", err)
	}

	hash, err := HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := &store.User{
		Email:        req.Email,
		FullName:     req.FullName,
		PasswordHash: hash,
	}

	if err := s.userStore.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

func (s *AuthService) Authenticate(ctx context.Context, email, password string) (*store.User, error) {
	user, err := s.userStore.GetByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrInvalidCredentials
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	if !CheckPassword(user.PasswordHash, password) {
		return nil, ErrInvalidCredentials
	}

	return user, nil
}
