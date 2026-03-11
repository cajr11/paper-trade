package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/cajr11/paper-trade/backend/internal/auth"
	"github.com/cajr11/paper-trade/backend/internal/db"
	"github.com/cajr11/paper-trade/backend/internal/health"
	"github.com/cajr11/paper-trade/backend/internal/store"
	"github.com/cajr11/paper-trade/backend/internal/tickers"
	"github.com/go-chi/chi/v5"
)

var user string = os.Getenv("POSTGRES_USER")
var password string = os.Getenv("POSTGRES_PASSWORD")
var dbName string = os.Getenv("POSTGRES_DB")
var dbHost string = os.Getenv("DB_HOST")

var addr string = fmt.Sprintf("postgres://%s:%s@%s:5432/%s?sslmode=disable", user, password, dbHost, dbName)

func main(){
  cfg := config{
		addr: env.GetString("ADDR", ":8080"),
		db: dbConfig{
			addr: env.GetString("DB_ADDR", "postgres://user:adminpassword@localhost/social-network?sslmode=disabled"),
			maxOpenConns: env.GetInt("DB_MAX_OPEN_CONNS", 30),
			maxIdleConns: env.GetInt("DB_MAX_IDLE_CONNS", 30),
			maxIdleTime: env.GetString("DB_MAX_IDLE_TIME", "15min"),
		},
	}
  db, err := db.New(addr, 30, 30, "15m")

  if err != nil {
		log.Panic(err)
	}

  store := store.NewStorage(db)


  r.Use(middleware.Timeout(60 * time.Second))

	// Get
	r.Get("/", serve)
	r.Get("/health", health.HandleHealthCheck)
	r.Get("/tickers", tickers.HandleGetAllPairs)

  // Post
  r.Post("/auth", auth.Login)


  http.ListenAndServe(":8080", r)
}


func serve(w http.ResponseWriter, r *http.Request){
  
   println("server running on port 8080")

   w.Write([]byte("welcome"))
}
