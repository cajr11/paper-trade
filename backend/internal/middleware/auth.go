package middleware

import (
	"net/http"
	"strings"

	appcontext "github.com/cajr11/paper-trade/backend/internal/context"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

type TokenValidator func(tokenString string) (*Claims, error)

var validateToken TokenValidator

func SetTokenValidator(v TokenValidator) {
	validateToken = v
}

func AuthRequired(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"error":"missing authorization header"}`, http.StatusUnauthorized)
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			http.Error(w, `{"error":"invalid authorization format"}`, http.StatusUnauthorized)
			return
		}

		claims, err := validateToken(parts[1])
		if err != nil {
			http.Error(w, `{"error":"invalid or expired token"}`, http.StatusUnauthorized)
			return
		}

		ctx := appcontext.WithUserID(r.Context(), claims.UserID)
		ctx = appcontext.WithUserEmail(ctx, claims.Email)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
