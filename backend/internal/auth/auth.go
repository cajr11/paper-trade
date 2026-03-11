package auth

import (
	"time"

)

type Session struct {
	Token string
}

type LoginRequest struct {
	Email string `validate:"required,email" json:"email"`
	Password string `validate:"required,min=8,containsany=ABCDEFGHIJKLMNOPQRSTUVWXYZ,containsany=abcdefghijklmnopqrstuvwxyz,containsany=0123456789,containsany=!@#$%^&*()_+-=" json:"password"`
}