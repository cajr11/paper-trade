package auth

import (
	"time"

)


type User struct {
	Id string
	Email string
	FullName string
	PasswordHash string `json:"-"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Session struct {
	Token string
	User User
}

type LoginRequest struct {
	Email string `validate:"required,email" json:"email"`
	Password string `validate:"required,min=8,containsany=ABCDEFGHIJKLMNOPQRSTUVWXYZ,containsany=abcdefghijklmnopqrstuvwxyz,containsany=0123456789,containsany=!@#$%^&*()_+-=" json:"password"`
}