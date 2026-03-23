package auth

import (
	"encoding/json"
	"errors"
	"net/http"

	appcontext "github.com/cajr11/paper-trade/backend/internal/context"
	"github.com/cajr11/paper-trade/backend/internal/validator"
)

type AuthHandler struct {
	service *AuthService
}

func NewAuthHandler(service *AuthService) *AuthHandler {
	return &AuthHandler{service: service}
}

func (h *AuthHandler) HandleSignup(w http.ResponseWriter, r *http.Request) {
	var req SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "validation failed", "details": err.Error()})
		return
	}

	user, err := h.service.CreateUser(r.Context(), req)
	if err != nil {
		if errors.Is(err, ErrEmailTaken) {
			writeJSON(w, http.StatusConflict, map[string]string{"error": "email already registered"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create account"})
		return
	}

	token, err := GenerateToken(user.ID, user.Email)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to generate token"})
		return
	}

	session := Session{
		Token: token,
		User: UserResponse{
			ID:       user.ID,
			Email:    user.Email,
			FullName: user.FullName,
			Balance:  user.Balance,
		},
	}

	writeJSON(w, http.StatusCreated, session)
}

func (h *AuthHandler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "validation failed", "details": err.Error()})
		return
	}

	user, err := h.service.Authenticate(r.Context(), req.Email, req.Password)
	if err != nil {
		if errors.Is(err, ErrInvalidCredentials) {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid credentials"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "authentication failed"})
		return
	}

	token, err := GenerateToken(user.ID, user.Email)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to generate token"})
		return
	}

	session := Session{
		Token: token,
		User: UserResponse{
			ID:       user.ID,
			Email:    user.Email,
			FullName: user.FullName,
			Balance:  user.Balance,
		},
	}

	writeJSON(w, http.StatusOK, session)
}

func (h *AuthHandler) HandleGetMe(w http.ResponseWriter, r *http.Request) {
	userID := appcontext.GetUserID(r.Context())

	user, err := h.service.userStore.GetByID(r.Context(), userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to fetch user"})
		return
	}

	writeJSON(w, http.StatusOK, UserResponse{
		ID:       user.ID,
		Email:    user.Email,
		FullName: user.FullName,
		Balance:  user.Balance,
	})
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
