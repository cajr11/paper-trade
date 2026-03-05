package tickers

import (
	"encoding/json"
	"net/http"
)

func HandleGetAllPairs(w http.ResponseWriter, r *http.Request){
	tickers, err := getAllPairs()
	w.Header().Set("Content-Type", "application/json")

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch pairs"})
		return
	}

	json.NewEncoder(w).Encode(tickers)
}