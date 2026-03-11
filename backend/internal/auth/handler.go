package auth

import (
	"encoding/json"
	"net/http"
	"github.com/cajr11/paper-trade/backend/internal/validator"
)

var invalidCredentials = map[string]string{"error": "Invalid credentials"}

func Login(w http.ResponseWriter, r *http.Request){
	var req LoginRequest
	err := json.NewDecoder(r.Body).Decode(&req)

	if (err != nil) {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(invalidCredentials)
		return
	}

	err = validator.ValidateStruct(req)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(invalidCredentials)
		return
	}

	

}