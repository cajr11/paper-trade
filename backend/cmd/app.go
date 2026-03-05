package main

import (
	"net/http"

	"github.com/cajr11/paper-trade/backend/internal/health"
	"github.com/cajr11/paper-trade/backend/internal/tickers"
	"github.com/go-chi/chi/v5"
)

func main(){
  r := chi.NewRouter()
  r.Get("/", serve)
  r.Get("/health", health.HandleHealthCheck)
  r.Get("/tickers", tickers.HandleGetAllPairs)
  http.ListenAndServe(":8080", r)
}


func serve(w http.ResponseWriter, r *http.Request){
  
   println("server running on port 8080")

   w.Write([]byte("welcome"))
}
