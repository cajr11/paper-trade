package main

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

func main(){
  r := chi.NewRouter()
  r.Get("/", serve)
  http.ListenAndServe(":8080", r)
}


func serve(w http.ResponseWriter, r *http.Request){
   println("server running on port 8080")
   w.Write([]byte("welcome"))
}
