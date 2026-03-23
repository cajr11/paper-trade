package auth

import (
	"os"
	"time"

	appMiddleware "github.com/cajr11/paper-trade/backend/internal/middleware"
	"github.com/golang-jwt/jwt/v5"
)

func getJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "paper-trade-dev-secret-change-in-production"
	}
	return []byte(secret)
}

func GenerateToken(userID, email string) (string, error) {
	claims := appMiddleware.Claims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJWTSecret())
}

func ValidateToken(tokenString string) (*appMiddleware.Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &appMiddleware.Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return getJWTSecret(), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*appMiddleware.Claims)
	if !ok || !token.Valid {
		return nil, jwt.ErrSignatureInvalid
	}

	return claims, nil
}

func init() {
	appMiddleware.SetTokenValidator(ValidateToken)
}
